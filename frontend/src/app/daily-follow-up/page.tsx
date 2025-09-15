import { Container } from '@/components/container'
import DailyFollowUpContent from '@/components/dailyFollowUpContent'
import Title from '@/components/title'
import React from 'react'

const DailyFollowUp = () => {
  return (
    <Container className='p-0'>
      <Title dir='rtl' className='w-[100%] mb-4 flex justify-between items-center'>
        المتابعة اليومية
      </Title>
      <DailyFollowUpContent isToday={true} />
    </Container>
  )
}

export default DailyFollowUp