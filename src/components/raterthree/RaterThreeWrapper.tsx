import { Album, Artist } from "../../generated/graphql"
import { Canvas } from '@react-three/fiber'
import React from 'react'



interface Props {
    artists:Artist[]|undefined
    albums:Array<Album>
}

export const RaterThreeWrapper = ({artists,albums}:Props) => {

    return <Canvas>
        <ambientLight intensity={0.1} />
        <directionalLight color="red" position={[0,0,5]}/>
        <mesh>
            <boxGeometry args={[2,2,2]}/>
            <meshStandardMaterial/>
        </mesh>
    </Canvas>

}