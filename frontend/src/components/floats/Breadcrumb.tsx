import React from 'react'

interface Props {
    breadcrumbs:Array<BreadcrumbEntry>
}

export const Breadcrumb = ({breadcrumbs}:Props) => {

    return <div className="fixed" id="breadcrumb" title="Breadcrumb">
        <div id="breadcrumb-wrapper">
          {breadcrumbs.map((it,i) => <BreadcrumbElement noSlash={ i === breadcrumbs.length-1 } key={'breadcrumb-'+i} breadcrumb={it}/>)}
        </div>
    </div>

}

interface BreadcrumbElementProps {
    breadcrumb:BreadcrumbEntry
    noSlash:boolean
}


export const BreadcrumbElement =  ({breadcrumb, noSlash}:BreadcrumbElementProps) => {

    const formatName = (name:string) => {
        const maxLen = 15
        if (name.length > maxLen ) {
            return name.slice(0,maxLen) + '...'
        }
        return name
    }

    return <div onClick={breadcrumb.action} className="breadcrumb-element"><span className="breadcrumb-text">{formatName(breadcrumb.title)}</span><span className="breadcrumb-slash">{ noSlash ? '' : '/'   }</span></div>
} 


export type BreadcrumbEntry = {
    title:string
    thumbnail?:string
    action:any
}   

