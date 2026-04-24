from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class SiteConnectivityBase(BaseModel):
    sitea_id: Optional[str] = None
    siteb_id: Optional[str] = None
    link_id: Optional[str] = None
    category_ne: Optional[str] = None
    depth: Optional[int] = None
    dependency: Optional[str] = None
    pop_site: Optional[str] = None
    child_site_connectivity: Optional[str] = None
    child_site_name: Optional[str] = None
    is_active: bool = True


class SiteConnectivityCreate(SiteConnectivityBase):
    pass


class SiteConnectivityUpdate(BaseModel):
    sitea_id: Optional[str] = None
    siteb_id: Optional[str] = None
    link_id: Optional[str] = None
    category_ne: Optional[str] = None
    depth: Optional[int] = None
    dependency: Optional[str] = None
    pop_site: Optional[str] = None
    child_site_connectivity: Optional[str] = None
    child_site_name: Optional[str] = None
    is_active: Optional[bool] = None


class SiteConnectivityOut(SiteConnectivityBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime


class SiteConnectivityListResponse(BaseModel):
    items: list[SiteConnectivityOut]
    total: int
    page: int
    page_size: int
