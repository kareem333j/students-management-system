import { Container } from '@/components/container'
import Title from '@/components/title';
import { Badge } from '@/components/ui/badge';
import UsersTable from '@/components/usersTable';
import React from 'react'

const Grade = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const res = await fetch(`http://127.0.0.1:8000/api/students/grades/${id}`);
  const grades = await res.json();
  
  return (
    <Container className='p-0'>
      <Title dir='rtl' className='w-[100%] mb-4 flex justify-between items-center'>
        {grades?.students?.grade}
        {
          grades?.students?.data?.length ? (
            <Badge
              className="h-7 min-w-7 rounded-full px-1 font-bold tabular-nums text-sm"
              variant="destructive"
            >
              {grades?.students?.data?.length}
            </Badge>
          ) : ''
        }
      </Title>
      <div className='flex justify-center items-center w-[100%] bg-white border border-dark rounded-md px-4 py-4'>
        <UsersTable
          students={grades?.students?.data}
        />
      </div>
    </Container>
  )
}

export default Grade