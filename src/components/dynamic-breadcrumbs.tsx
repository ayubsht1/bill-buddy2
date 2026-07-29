"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

function formatSegment(segment: string) {
  return segment
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export function DynamicBreadcrumbs() {
  const pathname = usePathname() || ""
  const pathSegments = pathname.split("/").filter(Boolean)

  if (pathSegments.length === 0) return null

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {pathSegments.map((segment, index) => {
          const href = `/${pathSegments.slice(0, index + 1).join("/")}`
          const isLast = index === pathSegments.length - 1
          const formattedTitle = formatSegment(segment)

          return (
            <React.Fragment key={href}>
              {/* Show separator before every item except the first */}
              {index > 0 && <BreadcrumbSeparator className="hidden md:block" />}
              
              <BreadcrumbItem className={!isLast ? "hidden md:block" : ""}>
                {isLast ? (
                  <BreadcrumbPage>{formattedTitle}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={href}>{formattedTitle}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}