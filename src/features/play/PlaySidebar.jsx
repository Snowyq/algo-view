import styled, { css } from "styled-components";
import PlayWindow from "./PlayWindow";
import React, { useContext, useState } from "react";
import { PlayContext } from "./PlayContext";
import CustomSelect from "../../ui/Select";
import MultiSelect from "../../ui/MultiSelect";
import ButtonIcon from "../../ui/ButtonIcon";
import { GoSidebarCollapse } from "react-icons/go";
import Select from "../../ui/Select";
import PlaySelectCategory from "./PlaySelectCategory";
import PlaySelectAlgorithms from "./PlaySelectAlgorithms";

function PlaySidebarComponent() {}

const PlaySidebar = React.memo(PlaySidebarComponent);

export default PlaySidebar;
