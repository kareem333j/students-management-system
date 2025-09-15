import { Container } from '@/components/container'
import QuizzesPageContent from '@/components/quizzesPageContent'
import Title from '@/components/title'
import React from 'react'

const Quizzes = () => {
  return (
    <Container className='p-0'>
      <Title dir='rtl' className='w-[100%] mb-4 flex justify-between items-center'>
        الأمتحانات 
      </Title>
      <QuizzesPageContent />
    </Container>
  )
}

export default Quizzes