import io
import math
import pandas as pd

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.microwave_link_budget import MicrowaveLinkBudget
from app.utils.microwave_link_budget_column_map import MICROWAVE_LINK_BUDGET_COLUMN_MAP

router = APIRouter(
    prefix="/microwave-link-budget-imports",
    tags=["Microwave Link Budget Imports"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def clean_value(value):
    if value is None:
        return None
    if isinstance(value, float) and math.isnan(value):
        return None
    return value


def to_bool(value):
    value = clean_value(value)
    if value is None:
        return None
    if isinstance(value, bool):
        return value

    text = str(value).strip().lower()
    if text in {"true", "1", "yes", "y", "active"}:
        return True
    if text in {"false", "0", "no", "n", "inactive"}:
        return False
    return None


@router.post("/upload")
async def upload_microwave_link_budget_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    if not file.filename.endswith((".xlsx", ".xls", ".csv")):
        raise HTTPException(status_code=400, detail="Only Excel or CSV files are allowed")

    content = await file.read()

    try:
        if file.filename.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(content))
        else:
            df = pd.read_excel(io.BytesIO(content))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read file: {str(e)}")

    missing_columns = [
        col for col in MICROWAVE_LINK_BUDGET_COLUMN_MAP.keys() if col not in df.columns
    ]
    if missing_columns:
        raise HTTPException(
            status_code=400,
            detail=f"Missing columns: {missing_columns}",
        )

    created_count = 0

    for _, row in df.iterrows():
        data = {}

        for excel_col, db_col in MICROWAVE_LINK_BUDGET_COLUMN_MAP.items():
            value = clean_value(row.get(excel_col))

            if db_col == "active":
                value = to_bool(value)

            data[db_col] = value

        item = MicrowaveLinkBudget(**data)
        db.add(item)
        created_count += 1

    db.commit()

    return {
        "message": "Microwave Link Budget file imported successfully",
        "created_count": created_count,
    }