import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';
import Paper from '@material-ui/core/Paper';
import { Button, IconButton, TextField } from '@material-ui/core';
import AddCircleIcon from '@material-ui/icons/AddCircle';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    listStyle: 'none',
    padding: theme.spacing(0.5),
    margin: 10,
  },
  chip: {
    margin: theme.spacing(0.5),
  },
  textAdd: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
}));

export default function ChipsArray({
  initialChips,
  placeholder = 'Add new category',
  onChange,
}) {
  const classes = useStyles();
  const [chipData, setChipData] = useState([...initialChips]);
  const [textAdd, setTextAdd] = useState('');

  const handleDelete = (chipToDelete) => () => {
    setChipData((chips) => {
      let newChips = chips.filter((chip) => chip.key !== chipToDelete.key);
      onChange(newChips.map((chip) => chip.label));
      return newChips;
    });
  };

  const addChip = () => {
    let isUnique = true;
    chipData.forEach((chip) => {
      if (chip.label.toLowerCase() === textAdd.toLowerCase()) {
        isUnique = false;
      }
    });
    if (textAdd !== '') {
      if (isUnique) {
        setChipData((s) => {
          s.push({ key: s.length, label: textAdd });
          onChange(s.map((chip) => chip.label));
          return s;
        });
        setTextAdd('');
      } else {
        alert('Already exists');
      }
    } else {
      alert('Place write something.');
    }
  };

  return (
    <>
      <div className={classes.textAdd}>
        <TextField
          value={textAdd}
          onChange={(e) => setTextAdd(e.target.value)}
          placeholder={placeholder}
          variant="outlined"
        />
        <IconButton onClick={addChip}>
          <AddCircleIcon />
        </IconButton>
      </div>
      <Paper elevation={3} component="ul" className={classes.root}>
        {chipData.map((data) => {
          return (
            <li key={data.key}>
              <Chip
                label={data.label}
                onDelete={
                  data.label === 'React' ? undefined : handleDelete(data)
                }
                className={classes.chip}
              />
            </li>
          );
        })}
      </Paper>
    </>
  );
}
