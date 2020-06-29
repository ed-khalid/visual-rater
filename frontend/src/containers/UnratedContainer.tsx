import React from "react";
import { Unrated } from "../components/Unrated";
import { connect } from "react-redux";
import { Item } from "../models/item";

const UnratedContainer = ({items}:{items:Item[]}) => (
    <Unrated items={items} ></Unrated>
);

export default connect(UnratedContainer);
      