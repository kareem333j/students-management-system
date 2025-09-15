import Image from 'next/image'
import { Container } from './container'
import logo from '../../public/logo.png';

const MainBack = () => {
  return (
    <Container className='min-h-[70vh] flex justify-center items-center'>
      <div className='text-center text-3xl'>
        <Image
          src={logo}
          width={400}
          height={400}
          alt='logo'
          className='opacity-50'
        />
      </div>
    </Container>
  )
}

export default MainBack