import { CreateSiteForm } from '@/components/CreateSiteForm'
import MaxWidthWrapper from '@/components/MaxWidthaWrapper'
import React from 'react'

const page = () => {
  return (
    <>
      <MaxWidthWrapper>
        <CreateSiteForm/>
      </MaxWidthWrapper>
    </>
    )
}

export default page