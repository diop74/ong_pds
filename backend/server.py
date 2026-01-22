from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Form, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import shutil
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
import base64

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Upload directories
UPLOAD_DIR = ROOT_DIR / "uploads"
IMAGES_DIR = UPLOAD_DIR / "images"
DOCUMENTS_DIR = UPLOAD_DIR / "documents"
IMAGES_DIR.mkdir(parents=True, exist_ok=True)
DOCUMENTS_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
ALLOWED_DOC_TYPES = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'porte-du-savoir-secret-key-2024')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

app = FastAPI(title="Porte du Savoir API")
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ==================== MODELS ====================

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: str
    name: str
    role: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class ProjectBase(BaseModel):
    title: str
    description: str
    objectives: str
    status: str = "en_cours"  # en_cours, termine
    image_url: Optional[str] = None
    date: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectResponse(ProjectBase):
    model_config = ConfigDict(extra="ignore")
    id: str
    created_at: str
    updated_at: str

class ArticleBase(BaseModel):
    title: str
    content: str
    excerpt: str
    category: str
    image_url: Optional[str] = None
    published: bool = True

class ArticleCreate(ArticleBase):
    pass

class ArticleResponse(ArticleBase):
    model_config = ConfigDict(extra="ignore")
    id: str
    created_at: str
    updated_at: str

class MemberBase(BaseModel):
    name: str
    email: EmailStr
    phone: str
    member_type: str = "actif"  # fondateur, actif, honneur
    bio: Optional[str] = None
    approved: bool = False

class MemberCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    motivation: str

class MemberAdminCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    member_type: str = "actif"
    bio: Optional[str] = None

class MemberResponse(MemberBase):
    model_config = ConfigDict(extra="ignore")
    id: str
    motivation: Optional[str] = None
    created_at: str
    updated_at: str

class DocumentBase(BaseModel):
    title: str
    description: str
    file_url: str
    file_type: str  # pdf, doc
    category: str  # statuts, reglement, autre

class DocumentCreate(DocumentBase):
    pass

class DocumentResponse(DocumentBase):
    model_config = ConfigDict(extra="ignore")
    id: str
    created_at: str

class ContactMessageCreate(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str

class ContactMessageResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    email: str
    subject: str
    message: str
    read: bool
    created_at: str

class SiteContentUpdate(BaseModel):
    key: str
    value: str

class SiteContentResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    key: str
    value: str

class StatsResponse(BaseModel):
    projects_count: int
    articles_count: int
    members_count: int
    messages_count: int

# ==================== AUTH HELPERS ====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="Utilisateur non trouvé")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expiré")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token invalide")

async def require_admin(user: dict = Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Accès admin requis")
    return user

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email déjà utilisé")
    
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "password": hash_password(user_data.password),
        "role": "admin",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_doc)
    
    token = create_token(user_id, "admin")
    return TokenResponse(
        access_token=token,
        user=UserResponse(id=user_id, email=user_data.email, name=user_data.name, role="admin")
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
    
    token = create_token(user["id"], user["role"])
    return TokenResponse(
        access_token=token,
        user=UserResponse(id=user["id"], email=user["email"], name=user["name"], role=user["role"])
    )

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(user: dict = Depends(get_current_user)):
    return UserResponse(id=user["id"], email=user["email"], name=user["name"], role=user["role"])

# ==================== PROJECTS ROUTES ====================

@api_router.get("/projects", response_model=List[ProjectResponse])
async def get_projects(status: Optional[str] = None):
    query = {}
    if status:
        query["status"] = status
    projects = await db.projects.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    return projects

@api_router.get("/projects/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: str):
    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Projet non trouvé")
    return project

@api_router.post("/projects", response_model=ProjectResponse)
async def create_project(project: ProjectCreate, user: dict = Depends(require_admin)):
    now = datetime.now(timezone.utc).isoformat()
    project_doc = {
        "id": str(uuid.uuid4()),
        **project.model_dump(),
        "created_at": now,
        "updated_at": now
    }
    await db.projects.insert_one(project_doc)
    result = await db.projects.find_one({"id": project_doc["id"]}, {"_id": 0})
    return result

@api_router.put("/projects/{project_id}", response_model=ProjectResponse)
async def update_project(project_id: str, project: ProjectCreate, user: dict = Depends(require_admin)):
    existing = await db.projects.find_one({"id": project_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Projet non trouvé")
    
    update_data = {
        **project.model_dump(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.projects.update_one({"id": project_id}, {"$set": update_data})
    updated = await db.projects.find_one({"id": project_id}, {"_id": 0})
    return updated

@api_router.delete("/projects/{project_id}")
async def delete_project(project_id: str, user: dict = Depends(require_admin)):
    result = await db.projects.delete_one({"id": project_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Projet non trouvé")
    return {"message": "Projet supprimé"}

# ==================== ARTICLES ROUTES ====================

@api_router.get("/articles", response_model=List[ArticleResponse])
async def get_articles(category: Optional[str] = None, published_only: bool = True):
    query = {}
    if category:
        query["category"] = category
    if published_only:
        query["published"] = True
    articles = await db.articles.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    return articles

@api_router.get("/articles/{article_id}", response_model=ArticleResponse)
async def get_article(article_id: str):
    article = await db.articles.find_one({"id": article_id}, {"_id": 0})
    if not article:
        raise HTTPException(status_code=404, detail="Article non trouvé")
    return article

@api_router.post("/articles", response_model=ArticleResponse)
async def create_article(article: ArticleCreate, user: dict = Depends(require_admin)):
    now = datetime.now(timezone.utc).isoformat()
    article_doc = {
        "id": str(uuid.uuid4()),
        **article.model_dump(),
        "created_at": now,
        "updated_at": now
    }
    await db.articles.insert_one(article_doc)
    return {k: v for k, v in article_doc.items() if k != "_id"}

@api_router.put("/articles/{article_id}", response_model=ArticleResponse)
async def update_article(article_id: str, article: ArticleCreate, user: dict = Depends(require_admin)):
    existing = await db.articles.find_one({"id": article_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Article non trouvé")
    
    update_data = {
        **article.model_dump(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.articles.update_one({"id": article_id}, {"$set": update_data})
    updated = await db.articles.find_one({"id": article_id}, {"_id": 0})
    return updated

@api_router.delete("/articles/{article_id}")
async def delete_article(article_id: str, user: dict = Depends(require_admin)):
    result = await db.articles.delete_one({"id": article_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Article non trouvé")
    return {"message": "Article supprimé"}

# ==================== MEMBERS ROUTES ====================

@api_router.get("/members", response_model=List[MemberResponse])
async def get_members(approved_only: bool = True, member_type: Optional[str] = None):
    query = {}
    if approved_only:
        query["approved"] = True
    if member_type:
        query["member_type"] = member_type
    members = await db.members.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    return members

@api_router.get("/members/pending", response_model=List[MemberResponse])
async def get_pending_members(user: dict = Depends(require_admin)):
    members = await db.members.find({"approved": False}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return members

@api_router.post("/members/apply", response_model=MemberResponse)
async def apply_membership(member: MemberCreate):
    now = datetime.now(timezone.utc).isoformat()
    member_doc = {
        "id": str(uuid.uuid4()),
        "name": member.name,
        "email": member.email,
        "phone": member.phone,
        "motivation": member.motivation,
        "member_type": "actif",
        "bio": None,
        "approved": False,
        "created_at": now,
        "updated_at": now
    }
    await db.members.insert_one(member_doc)
    return {k: v for k, v in member_doc.items() if k != "_id"}

@api_router.put("/members/{member_id}/approve")
async def approve_member(member_id: str, member_type: str = "actif", user: dict = Depends(require_admin)):
    result = await db.members.update_one(
        {"id": member_id},
        {"$set": {"approved": True, "member_type": member_type, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Membre non trouvé")
    return {"message": "Membre approuvé"}

@api_router.put("/members/{member_id}/reject")
async def reject_member(member_id: str, user: dict = Depends(require_admin)):
    result = await db.members.delete_one({"id": member_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Membre non trouvé")
    return {"message": "Demande rejetée"}

@api_router.delete("/members/{member_id}")
async def delete_member(member_id: str, user: dict = Depends(require_admin)):
    result = await db.members.delete_one({"id": member_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Membre non trouvé")
    return {"message": "Membre supprimé"}

@api_router.post("/members", response_model=MemberResponse)
async def create_member(member: MemberAdminCreate, user: dict = Depends(require_admin)):
    """Admin creates a member directly (already approved)"""
    now = datetime.now(timezone.utc).isoformat()
    member_doc = {
        "id": str(uuid.uuid4()),
        "name": member.name,
        "email": member.email,
        "phone": member.phone,
        "member_type": member.member_type,
        "bio": member.bio,
        "motivation": None,
        "approved": True,
        "created_at": now,
        "updated_at": now
    }
    await db.members.insert_one(member_doc)
    return {k: v for k, v in member_doc.items() if k != "_id"}

@api_router.put("/members/{member_id}")
async def update_member(member_id: str, member: MemberAdminCreate, user: dict = Depends(require_admin)):
    """Admin updates a member"""
    existing = await db.members.find_one({"id": member_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Membre non trouvé")
    
    update_data = {
        "name": member.name,
        "email": member.email,
        "phone": member.phone,
        "member_type": member.member_type,
        "bio": member.bio,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.members.update_one({"id": member_id}, {"$set": update_data})
    updated = await db.members.find_one({"id": member_id}, {"_id": 0})
    return updated

# ==================== DOCUMENTS ROUTES ====================

@api_router.get("/documents", response_model=List[DocumentResponse])
async def get_documents(category: Optional[str] = None):
    query = {}
    if category:
        query["category"] = category
    documents = await db.documents.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    return documents

@api_router.post("/documents", response_model=DocumentResponse)
async def create_document(document: DocumentCreate, user: dict = Depends(require_admin)):
    doc = {
        "id": str(uuid.uuid4()),
        **document.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.documents.insert_one(doc)
    return {k: v for k, v in doc.items() if k != "_id"}

@api_router.delete("/documents/{document_id}")
async def delete_document(document_id: str, user: dict = Depends(require_admin)):
    result = await db.documents.delete_one({"id": document_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Document non trouvé")
    return {"message": "Document supprimé"}

# ==================== CONTACT ROUTES ====================

@api_router.get("/contact", response_model=List[ContactMessageResponse])
async def get_messages(user: dict = Depends(require_admin)):
    messages = await db.contact_messages.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return messages

@api_router.post("/contact")
async def send_message(message: ContactMessageCreate):
    msg_doc = {
        "id": str(uuid.uuid4()),
        **message.model_dump(),
        "read": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.contact_messages.insert_one(msg_doc)
    return {"message": "Message envoyé avec succès"}

@api_router.put("/contact/{message_id}/read")
async def mark_as_read(message_id: str, user: dict = Depends(require_admin)):
    result = await db.contact_messages.update_one({"id": message_id}, {"$set": {"read": True}})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Message non trouvé")
    return {"message": "Marqué comme lu"}

@api_router.delete("/contact/{message_id}")
async def delete_message(message_id: str, user: dict = Depends(require_admin)):
    result = await db.contact_messages.delete_one({"id": message_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Message non trouvé")
    return {"message": "Message supprimé"}

# ==================== SITE CONTENT ROUTES ====================

@api_router.get("/content", response_model=List[SiteContentResponse])
async def get_all_content():
    content = await db.site_content.find({}, {"_id": 0}).to_list(100)
    return content

@api_router.get("/content/{key}")
async def get_content(key: str):
    content = await db.site_content.find_one({"key": key}, {"_id": 0})
    if not content:
        return {"key": key, "value": ""}
    return content

@api_router.put("/content")
async def update_content(content: SiteContentUpdate, user: dict = Depends(require_admin)):
    await db.site_content.update_one(
        {"key": content.key},
        {"$set": {"key": content.key, "value": content.value}},
        upsert=True
    )
    return {"message": "Contenu mis à jour"}

# ==================== STATS ROUTES ====================

@api_router.get("/stats", response_model=StatsResponse)
async def get_stats():
    projects_count = await db.projects.count_documents({})
    articles_count = await db.articles.count_documents({"published": True})
    members_count = await db.members.count_documents({"approved": True})
    messages_count = await db.contact_messages.count_documents({"read": False})
    return StatsResponse(
        projects_count=projects_count,
        articles_count=articles_count,
        members_count=members_count,
        messages_count=messages_count
    )

@api_router.get("/admin/stats")
async def get_admin_stats(user: dict = Depends(require_admin)):
    projects_count = await db.projects.count_documents({})
    articles_count = await db.articles.count_documents({})
    members_count = await db.members.count_documents({"approved": True})
    pending_members = await db.members.count_documents({"approved": False})
    messages_count = await db.contact_messages.count_documents({})
    unread_messages = await db.contact_messages.count_documents({"read": False})
    
    return {
        "projects": projects_count,
        "articles": articles_count,
        "members": members_count,
        "pending_members": pending_members,
        "messages": messages_count,
        "unread_messages": unread_messages
    }

# ==================== UPLOAD ROUTES ====================

@api_router.post("/upload/image")
async def upload_image(file: UploadFile = File(...), user: dict = Depends(require_admin)):
    """Upload an image file"""
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Type de fichier non autorisé. Utilisez JPG, PNG, WebP ou GIF.")
    
    # Check file size
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="Fichier trop volumineux. Maximum 10MB.")
    
    # Generate unique filename
    ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    filename = f"{uuid.uuid4()}.{ext}"
    filepath = IMAGES_DIR / filename
    
    # Save file
    with open(filepath, "wb") as f:
        f.write(content)
    
    # Return URL
    return {"url": f"/uploads/images/{filename}", "filename": filename}

@api_router.post("/upload/document")
async def upload_document(file: UploadFile = File(...), user: dict = Depends(require_admin)):
    """Upload a document file (PDF, DOC)"""
    if file.content_type not in ALLOWED_DOC_TYPES:
        raise HTTPException(status_code=400, detail="Type de fichier non autorisé. Utilisez PDF ou DOC.")
    
    # Check file size
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="Fichier trop volumineux. Maximum 10MB.")
    
    # Generate unique filename while keeping original name info
    original_name = file.filename.rsplit(".", 1)[0] if "." in file.filename else file.filename
    ext = file.filename.split(".")[-1] if "." in file.filename else "pdf"
    filename = f"{uuid.uuid4()}_{original_name[:30]}.{ext}"
    filepath = DOCUMENTS_DIR / filename
    
    # Save file
    with open(filepath, "wb") as f:
        f.write(content)
    
    # Return URL
    return {"url": f"/uploads/documents/{filename}", "filename": filename}

@api_router.delete("/upload/{file_type}/{filename}")
async def delete_upload(file_type: str, filename: str, user: dict = Depends(require_admin)):
    """Delete an uploaded file"""
    if file_type == "images":
        filepath = IMAGES_DIR / filename
    elif file_type == "documents":
        filepath = DOCUMENTS_DIR / filename
    else:
        raise HTTPException(status_code=400, detail="Type de fichier invalide")
    
    if filepath.exists():
        os.remove(filepath)
        return {"message": "Fichier supprimé"}
    raise HTTPException(status_code=404, detail="Fichier non trouvé")

# ==================== SEED DATA ====================

@api_router.post("/seed")
async def seed_data():
    """Seed initial demo data"""
    # Check if data already exists
    projects_count = await db.projects.count_documents({})
    if projects_count > 0:
        return {"message": "Données déjà initialisées"}
    
    now = datetime.now(timezone.utc).isoformat()
    
    # Seed Projects
    projects = [
        {
            "id": str(uuid.uuid4()),
            "title": "Programme d'Alphabétisation",
            "description": "Programme intensif d'alphabétisation pour les adultes de Nouadhibou. Ce projet vise à réduire l'analphabétisme dans notre communauté en offrant des cours gratuits adaptés aux besoins de chaque apprenant.",
            "objectives": "Former 500 adultes à la lecture et l'écriture en arabe et français d'ici 2025",
            "status": "en_cours",
            "image_url": "https://images.unsplash.com/photo-1521493959102-bdd6677fdd81?w=800",
            "date": "2024-01-15",
            "created_at": now,
            "updated_at": now
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Bibliothèque Mobile",
            "description": "Création d'une bibliothèque mobile pour desservir les quartiers éloignés de Nouadhibou. Des livres, manuels scolaires et ressources éducatives sont mis à disposition gratuitement.",
            "objectives": "Atteindre 1000 lecteurs par mois dans 10 quartiers différents",
            "status": "en_cours",
            "image_url": "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800",
            "date": "2024-03-01",
            "created_at": now,
            "updated_at": now
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Formation Professionnelle Jeunes",
            "description": "Programme de formation aux métiers du numérique pour les jeunes de 18 à 30 ans. Initiation à l'informatique, bureautique et compétences digitales essentielles.",
            "objectives": "Former 200 jeunes aux compétences numériques de base",
            "status": "termine",
            "image_url": "https://images.unsplash.com/flagged/photo-1579133311477-9121405c78dd?w=800",
            "date": "2023-09-01",
            "created_at": now,
            "updated_at": now
        }
    ]
    await db.projects.insert_many(projects)
    
    # Seed Articles
    articles = [
        {
            "id": str(uuid.uuid4()),
            "title": "Inauguration du Centre de Formation",
            "content": "Nous avons le plaisir d'annoncer l'inauguration de notre nouveau centre de formation à Nouadhibou. Ce centre permettra d'accueillir jusqu'à 100 apprenants simultanément dans des conditions optimales d'apprentissage. Les installations comprennent des salles de classe climatisées, une salle informatique équipée et une bibliothèque.",
            "excerpt": "Notre nouveau centre de formation ouvre ses portes avec des installations modernes.",
            "category": "Événements",
            "image_url": "https://images.unsplash.com/photo-1555069855-e580a9adbf43?w=800",
            "published": True,
            "created_at": now,
            "updated_at": now
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Succès du Programme d'Été 2024",
            "content": "Le programme d'été 2024 s'est achevé avec un succès remarquable. Plus de 300 enfants ont participé aux activités éducatives et récréatives organisées pendant les vacances scolaires. Au programme : soutien scolaire, ateliers de lecture, activités artistiques et sorties culturelles.",
            "excerpt": "Plus de 300 enfants ont bénéficié de notre programme d'activités estivales.",
            "category": "Actualités",
            "image_url": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800",
            "published": True,
            "created_at": now,
            "updated_at": now
        }
    ]
    await db.articles.insert_many(articles)
    
    # Seed Members
    members = [
        {
            "id": str(uuid.uuid4()),
            "name": "Mohamed Ould Ahmed",
            "email": "mohamed@example.com",
            "phone": "+222 22 22 22 22",
            "member_type": "fondateur",
            "bio": "Président fondateur de l'ONG, enseignant à la retraite avec 30 ans d'expérience dans l'éducation.",
            "motivation": None,
            "approved": True,
            "created_at": now,
            "updated_at": now
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Fatima Mint Sidi",
            "email": "fatima@example.com",
            "phone": "+222 33 33 33 33",
            "member_type": "fondateur",
            "bio": "Secrétaire générale, spécialiste en développement communautaire.",
            "motivation": None,
            "approved": True,
            "created_at": now,
            "updated_at": now
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Amadou Ba",
            "email": "amadou@example.com",
            "phone": "+222 44 44 44 44",
            "member_type": "actif",
            "bio": "Bénévole actif, coordinateur des programmes jeunesse.",
            "motivation": None,
            "approved": True,
            "created_at": now,
            "updated_at": now
        }
    ]
    await db.members.insert_many(members)
    
    # Seed Site Content
    content = [
        {"key": "mission", "value": "Promouvoir l'éducation et l'accès au savoir pour tous les citoyens de Nouadhibou et de la Mauritanie. Nous croyons que l'éducation est la clé du développement durable."},
        {"key": "vision", "value": "Une Mauritanie où chaque personne a accès à une éducation de qualité, quel que soit son origine sociale ou économique."},
        {"key": "about", "value": "Fondée en 2020, l'ONG Porte du Savoir (Udditaare Ganndal) œuvre pour la promotion de l'éducation à Nouadhibou. Notre équipe de bénévoles dévoués travaille chaque jour pour offrir des opportunités d'apprentissage à ceux qui en ont le plus besoin."},
        {"key": "address", "value": "Quartier Numerowatt, Nouadhibou, Mauritanie"},
        {"key": "email", "value": "contact@portedusavoir.org"},
        {"key": "phone", "value": "+222 45 00 00 00"}
    ]
    for c in content:
        await db.site_content.update_one({"key": c["key"]}, {"$set": c}, upsert=True)
    
    # Create default admin
    admin_exists = await db.users.find_one({"email": "admin@portedusavoir.org"})
    if not admin_exists:
        admin = {
            "id": str(uuid.uuid4()),
            "email": "admin@portedusavoir.org",
            "name": "Administrateur",
            "password": hash_password("Admin123!"),
            "role": "admin",
            "created_at": now
        }
        await db.users.insert_one(admin)
    
    return {"message": "Données de démonstration créées avec succès", "admin_email": "admin@portedusavoir.org", "admin_password": "Admin123!"}

# Root endpoint
@api_router.get("/")
async def root():
    return {"message": "API Porte du Savoir - Bienvenue"}

# Include router
app.include_router(api_router)

# Serve uploaded files statically
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
