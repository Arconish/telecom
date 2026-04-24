from datetime import datetime

from sqlalchemy import Boolean, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class SiteDependency(Base):
    __tablename__ = "site_dependencies"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    site_id: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    fe: Mapped[str | None] = mapped_column(String(255), nullable=True)
    existed_in_mw_protection_path: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )
    child_site_id: Mapped[str | None] = mapped_column(String(1000), index=True, nullable=True)
    pop_site: Mapped[str | None] = mapped_column(String(255), index=True, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )
