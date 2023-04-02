import { Button, Checkbox, FormControlLabel } from "@material-ui/core";
import React from "react";
import { useEffect } from "react";
import { useState } from "react";

const mapListToDict = (list) => {
  let dict = {};
  list.forEach((item) => {
    dict[item] = true;
  });
  return dict;
};

export default function SelectFromList({ list = [], label, onSave }) {
  const [dict, setDict] = useState({});

  const handleSave = () => {
    const newList = [];
    Object.keys(dict).forEach((item) => {
      if (dict[item]) {
        newList.push(item);
      }
    });
    onSave(newList);
  };

  const handleBulk = (shouldSelect) => {
    // clear the dict
    const newDict = { ...dict };
    Object.keys(newDict).forEach((item) => {
      newDict[item] = shouldSelect;
    });
    setDict(newDict);
  };

  useEffect(() => {
    console.log(dict);
    setDict(mapListToDict(list));
  }, [list]);

  const areAllSelected = () => {
    let allSelected = true;
    Object.keys(dict).forEach((item) => {
      if (!dict[item]) {
        allSelected = false;
      }
    });
    return allSelected;
  };

  const allSelected = areAllSelected();

  return (
    <div style={{ display: "flex", flexWrap: "wrap" }}>
      <h2 style={{ margin: "20px 0", width: "100%" }}>{label}</h2>
      {Object.keys(dict).map((item) => (
        <FormControlLabel
          style={{ width: 80, padding: 5, margin: 5 }}
          control={
            <Checkbox
              checked={dict[item]}
              onChange={(e) =>
                setDict((s) => ({ ...s, [item]: e.target.checked }))
              }
              color="primary"
            />
          }
          label={item}
        />
      ))}
      <Button
        style={{ width: "100%", margin: "20px 0" }}
        color="primary"
        variant="contained"
        onClick={handleSave}
      >
        Save
      </Button>
      <Button
        style={{ width: "30%", margin: "20px 0" }}
        color="default"
        variant="contained"
        onClick={() => handleBulk(allSelected ? false : true)}
      >
        {allSelected ? `Unselect All` : "Select All"}
      </Button>
    </div>
  );
}
