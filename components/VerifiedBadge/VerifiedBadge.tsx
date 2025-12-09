import { FC } from 'react'
import { CheckBadgeIcon } from '@heroicons/react/24/solid'
import { StyledVerifiedBadge } from './'

type Props = {
  size?: number
}

const VerifiedBadge: FC<Props> = ({ size }) => {
  return (
    <StyledVerifiedBadge size={size}>
      <CheckBadgeIcon />
    </StyledVerifiedBadge>
  )
}

export default VerifiedBadge
