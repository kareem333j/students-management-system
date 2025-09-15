import { Container } from '@/components/container'

const Loading = () => {
    return (
        <Container>
            <div className="w-[100%] flex justify-center items-center my-30 flex-col gap-5">
                <div className="animate-spin rounded-full h-15 w-15 border-b-2 border-gray-900"></div>
                <p className='text-2xl' dir='rtl'>جاري التحميل</p>
            </div>
        </Container>
    )
}

export default Loading