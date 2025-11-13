import Image from "next/image";
import Header from "./_components/header";
import SearchInput from "./_components/search-input";
import banner from '../public/banner.png'

const Home = () => {
  return (
    <div>
      <Header />
      <div className="space-y-4 px-5">
        <SearchInput />
        <Image 
          src={banner}
          alt={"Agende agora!"}
          sizes="100vw"
          className="w-full h-auto"
        />
      </div>
    </div>
  )
}

export default Home;