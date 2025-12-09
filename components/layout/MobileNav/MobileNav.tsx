import { FC } from 'react'
import { Item } from '@components/layout'
import { HeartIcon, HomeIcon, BoltIcon, MapPinIcon, MapIcon } from '@heroicons/react/24/outline'
import { StyledMobileNav } from './'

const MobileNav: FC = () => {
  return (
    <StyledMobileNav>
      <Item text="Home" icon={<HomeIcon />} route="/" />

      <Item text="My Maps" icon={<MapIcon />} route="/my-maps" />

      <Item text="Liked Maps" icon={<HeartIcon />} route="/liked" />

      <Item text="Country Streaks" icon={<BoltIcon />} route="/streaks" />

      <Item text="Daily Challenge" icon={<MapPinIcon />} route="/daily-challenge" />
    </StyledMobileNav>
  )
}

export default MobileNav
