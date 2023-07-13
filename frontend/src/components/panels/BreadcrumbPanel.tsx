import React from 'react'
import { Panel } from './Panel'

interface Props {
    breadcrumbs:Array<any>

}

export const BreadcrumbPanel = ({breadcrumbs}:Props) => {

    return <Panel id="breadcrumb" title="Breadcrumb">
        <div id="breadcrumb-wrapper">
          {breadcrumbs.map((it,i) => <BreadcrumbElement noSlash={ i === breadcrumbs.length-1 } key={'breadcrumb-'+i} breadcrumb={it}/>)}
        </div>
    </Panel>

}

interface BreadcrumbElementProps {
    breadcrumb:Breadcrumb
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


export type Breadcrumb = {
    title:string
    thumbnail?:string
    action:any
}   

