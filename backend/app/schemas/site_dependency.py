from datetime import datetime

from pydantic import BaseModel, ConfigDict


class SiteDependencyBase(BaseModel):
    site_id: str
    fe: str | None = None
    existed_in_mw_protection_path: bool = False
    child_site_id: str | None = None
    pop_site: str | None = None


class SiteDependencyCreate(SiteDependencyBase):
    pass


class SiteDependencyUpdate(BaseModel):
    site_id: str | None = None
    fe: str | None = None
    existed_in_mw_protection_path: bool | None = None
    child_site_id: str | None = None
    pop_site: str | None = None


class SiteDependencyRead(SiteDependencyBase):
    id: int
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)
