from pydantic import BaseModel
from typing import Optional, List


class ContentBlockBase(BaseModel):
    key: str
    title: Optional[str] = None
    content: Optional[str] = None
    extra_data: Optional[str] = None


class ContentBlockCreate(ContentBlockBase):
    pass


class ContentBlockUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    extra_data: Optional[str] = None


class ContentBlockResponse(ContentBlockBase):
    id: int

    class Config:
        from_attributes = True


class SiteSettingsBase(BaseModel):
    key: str
    value: str


class SiteSettingsResponse(SiteSettingsBase):
    id: int

    class Config:
        from_attributes = True


class GalleryImageBase(BaseModel):
    title: Optional[str] = None
    order: int = 0


class GalleryImageCreate(GalleryImageBase):
    filename: str


class GalleryImageResponse(GalleryImageBase):
    id: int
    filename: str
    is_active: bool

    class Config:
        from_attributes = True


class AllContentResponse(BaseModel):
    """Ответ со всем контентом для фронтенда"""
    general_info_title: Optional[str] = None
    general_info_content: Optional[str] = None
    location_title: Optional[str] = None
    location_content: Optional[str] = None
    infrastructure_title: Optional[str] = None
    infrastructure_content: Optional[str] = None
    hours_title: Optional[str] = None
    hours_content: Optional[str] = None
    contacts_title: Optional[str] = None
    contacts_phone: Optional[str] = None
    contacts_address: Optional[str] = None
    faq_title: Optional[str] = None
    faq_items: Optional[str] = None  # JSON с вопросами и ответами
    gallery_images: List[GalleryImageResponse] = []
