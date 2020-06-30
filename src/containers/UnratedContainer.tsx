import React from "react";
import { Unrated } from "../components/Unrated";
import { Item } from "../models/Item";

export const UnratedContainer = ({items}:{items:Item[]}) => (
    <Unrated items={items} ></Unrated>
);