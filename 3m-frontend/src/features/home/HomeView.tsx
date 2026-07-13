import { useNavigate } from 'react-router-dom'
import { HeroAsymmetrical } from '../../components/HeroAsymmetrical'
import { StaggeredGallery } from '../../components/StaggeredGallery'
import { FeaturedProduct } from '../../components/FeaturedProduct'
import { NewArrivals } from '../../components/NewArrivals'
import { BrandValues } from '../../components/BrandValues'
import { Testimonials } from '../../components/Testimonials'

export function HomeView() {
  const navigate = useNavigate()

  const handleShopClick = () => {
    navigate('/shop')
  }

  const handleItemClick = () => {
    
    navigate(`/shop`)
  }

  const handleExploreFeatured = () => {
    const el = document.getElementById('featured-product')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <>
      <HeroAsymmetrical
        onShopClick={handleShopClick}
        onExploreFeatured={handleExploreFeatured}
      />

      <NewArrivals />

      <StaggeredGallery
        onItemClick={handleItemClick}
      />

      <BrandValues />

      <FeaturedProduct />

      <Testimonials />
    </>
  )
}

