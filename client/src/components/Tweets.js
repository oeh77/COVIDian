import React, { useState, useEffect } from "react";
import clsx from "clsx";
import {
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Toolbar,
  Typography,
  Tooltip,
  IconButton,
  TableSortLabel,
  TablePagination,
} from "@material-ui/core";
import { makeStyles, lighten } from "@material-ui/core/styles";
import { createApolloFetch } from "apollo-fetch";

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const headCells = [
  {
    id: "tweet",
    numeric: false,
    disablePadding: true,
    label: "Tweet",
  },
  {
    id: "state",
    numeric: false,
    disablePadding: true,
    label: "State",
  },
  {
    id: "city",
    numeric: false,
    disablePadding: true,
    label: "City",
  },
  { id: "sadness", numeric: true, disablePadding: false, label: "Sadness" },
  { id: "joy", numeric: true, disablePadding: false, label: "Joy" },
  { id: "fear", numeric: true, disablePadding: false, label: "Fear" },
  { id: "digust", numeric: true, disablePadding: false, label: "Digust" },
  { id: "anger", numeric: true, disablePadding: false, label: "Anger" },
];

function EnhancedTableHead(props) {
  const {
    classes,
    // onSelectAllClick,
    order,
    orderBy,
    // numSelected,
    // rowCount,
    onRequestSort,
  } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell>
          {/* <Checkbox 
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{ "aria-label": "select all desserts" }}
          />*/}
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? "right" : "left"}
            padding={headCell.disablePadding ? "none" : "default"}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <span className={classes.visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </span>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

const useToolbarStyles = makeStyles((theme) => ({
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
  },
  highlight:
    theme.palette.type === "light"
      ? {
          color: theme.palette.secondary.main,
          backgroundColor: lighten(theme.palette.secondary.light, 0.85),
        }
      : {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.secondary.dark,
        },
  title: {
    flex: "1 1 100%",
  },
}));

const EnhancedTableToolbar = (props) => {
  const classes = useToolbarStyles();
  const { numSelected } = props;

  return (
    <Toolbar
      className={clsx(classes.root, {
        [classes.highlight]: numSelected > 0,
      })}
    >
      {numSelected > 0 ? (
        <Typography
          className={classes.title}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          {numSelected} selected
        </Typography>
      ) : (
        <Typography
          className={classes.title}
          variant="h6"
          id="tableTitle"
          component="div"
        >
          Tweets
        </Typography>
      )}

      {numSelected > 0 ? (
        <Tooltip title="Delete">
          <IconButton aria-label="delete">{/* <Delete /> */}</IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Filter list">
          <IconButton aria-label="filter list">
            {/* <FilterList /> */}
          </IconButton>
        </Tooltip>
      )}
    </Toolbar>
  );
};

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  paper: {
    width: "100%",
    marginBottom: theme.spacing(2),
  },
  table: {
    minWidth: 750,
  },
  visuallyHidden: {
    border: 0,
    clip: "rect(0 0 0 0)",
    height: 1,
    margin: -1,
    overflow: "hidden",
    padding: 0,
    position: "absolute",
    top: 20,
    width: 1,
  },
}));

const Tweets = ({ selectedState,changeLoadingStatus }) => {
  const classes = useStyles();
  const [data, setData] = useState([]);
  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState("calories");
  // const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // const handleSelectAllClick = (event) => {
  //   if (event.target.checked) {
  //     const newSelecteds = data.map((n) => n.name);
  //     setSelected(newSelecteds);
  //     return;
  //   }
  //   setSelected([]);
  // };

  // const handleClick = (event, name) => {
  //   const selectedIndex = selected.indexOf(name);
  //   let newSelected = [];

  //   if (selectedIndex === -1) {
  //     newSelected = newSelected.concat(selected, name);
  //   } else if (selectedIndex === 0) {
  //     newSelected = newSelected.concat(selected.slice(1));
  //   } else if (selectedIndex === selected.length - 1) {
  //     newSelected = newSelected.concat(selected.slice(0, -1));
  //   } else if (selectedIndex > 0) {
  //     newSelected = newSelected.concat(
  //       selected.slice(0, selectedIndex),
  //       selected.slice(selectedIndex + 1)
  //     );
  //   }

  //   setSelected(newSelected);
  // };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // const isSelected = (name) => selected.indexOf(name) !== -1;

  const emptyRows =
    rowsPerPage - Math.min(rowsPerPage, data.length - page * rowsPerPage);

  useEffect(() => {
    const fetch = createApolloFetch({
      uri: `http://localhost:5001/graphql`,
    });

    if (selectedState) {
      fetch({
        query: `{ sentiments(state: "${selectedState}") { tweet link state city sadness joy fear disgust anger }}`,
      }).then((res) => {
        // console.log(res.data);
        setData(res.data.sentiments);
      });
    } else {
      fetch({
        query:
          "{ sentiments { tweet link state city sadness joy fear disgust anger }}",
      }).then((res) => {
        // console.log(res.data);
        
        setData(res.data.sentiments);
        changeLoadingStatus(true)  
      });
    }
  }, [selectedState,changeLoadingStatus]);

  return (
    <div>
      <div className={classes.root}>
        <EnhancedTableToolbar />
        <TableContainer>
          <Table
            className={classes.table}
            aria-labelledby="tableTitle"
            size="medium"
            aria-label="enhanced table"
          >
            <EnhancedTableHead
              classes={classes}
              // numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              // onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              // rowCount={data.length}
            />
            <TableBody>
              {stableSort(data, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  // const isItemSelected = isSelected(row.name);
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <TableRow
                      hover
                      // onClick={(event) => handleClick(event, row.name)}
                      role="checkbox"
                      // aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={labelId}
                      // selected={isItemSelected}
                    >
                      <TableCell padding="checkbox">
                        {/*   <Checkbox
                            checked={isItemSelected}
                            inputProps={{ "aria-labelledby": labelId }}
                          />*/}
                      </TableCell>
                      <TableCell
                        component="th"
                        id={labelId}
                        scope="row"
                        padding="none"
                      >
                        {row.tweet}
                      </TableCell>
                      <TableCell align="right">{row.state}</TableCell>
                      <TableCell align="right">{row.city}</TableCell>
                      <TableCell align="right">
                        {row.sadness.toFixed(2)}
                      </TableCell>
                      <TableCell align="right">{row.joy.toFixed(2)}</TableCell>
                      <TableCell align="right">{row.fear.toFixed(2)}</TableCell>
                      <TableCell align="right">
                        {row.disgust.toFixed(2)}
                      </TableCell>
                      <TableCell align="right">
                        {row.anger.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={data.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </div>
    </div>
  );
};

export default Tweets;
