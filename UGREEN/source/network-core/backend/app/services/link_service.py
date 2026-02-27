from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.link import Link
from app.schemas.link import LinkCreate, LinkPatch
import uuid


async def list_links(db: AsyncSession) -> list[Link]:
    result = await db.execute(select(Link))
    return list(result.scalars().all())


async def get_link(db: AsyncSession, link_id: str) -> Link | None:
    return await db.get(Link, link_id)


async def create_link(db: AsyncSession, data: LinkCreate) -> Link:
    link = Link(id=str(uuid.uuid4()), **data.model_dump())
    db.add(link)
    await db.commit()
    await db.refresh(link)
    return link


async def update_link(db: AsyncSession, link_id: str, data: LinkPatch) -> Link | None:
    link = await db.get(Link, link_id)
    if not link:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(link, field, value)
    await db.commit()
    await db.refresh(link)
    return link


async def delete_link(db: AsyncSession, link_id: str) -> bool:
    link = await db.get(Link, link_id)
    if not link:
        return False
    await db.delete(link)
    await db.commit()
    return True
