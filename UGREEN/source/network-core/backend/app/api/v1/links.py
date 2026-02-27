from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.link import LinkCreate, LinkRead, LinkPatch
from app.services import link_service

router = APIRouter(prefix="/links", tags=["links"])


@router.get("", response_model=list[LinkRead])
async def list_links(db: AsyncSession = Depends(get_db)):
    return await link_service.list_links(db)


@router.post("", response_model=LinkRead, status_code=status.HTTP_201_CREATED)
async def create_link(data: LinkCreate, db: AsyncSession = Depends(get_db)):
    return await link_service.create_link(db, data)


@router.patch("/{link_id}", response_model=LinkRead)
async def patch_link(link_id: str, data: LinkPatch, db: AsyncSession = Depends(get_db)):
    link = await link_service.update_link(db, link_id, data)
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")
    return link


@router.delete("/{link_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_link(link_id: str, db: AsyncSession = Depends(get_db)):
    if not await link_service.delete_link(db, link_id):
        raise HTTPException(status_code=404, detail="Link not found")
