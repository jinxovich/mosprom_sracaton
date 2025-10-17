from pydantic import BaseModel

class InternshipBase(BaseModel):
    title: str
    description: str

class InternshipCreate(InternshipBase):
    pass

class Internship(InternshipBase):
    id: int
    is_published: bool
    owner_id: int

    class Config:
        from_attributes = True

class InternshipPublic(InternshipBase):
    id: int

    class Config:
        from_attributes = True