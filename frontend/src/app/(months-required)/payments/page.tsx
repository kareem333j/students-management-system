import { Container } from '@/components/container'
import PaymentsPageContent from '@/components/paymentsPageContent'
import Title from '@/components/title'
import React from 'react'

const Payments = () => {
  return (
    <Container className='p-0'>
      <Title dir='rtl' className='w-[100%] mb-4 flex justify-between items-center'>
        المصاريف
      </Title>
      <PaymentsPageContent />
    </Container>
  )
}

export default Payments