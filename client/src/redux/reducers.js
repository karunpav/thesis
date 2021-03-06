import { SET_USER, SET_CURRENT_BOARD, SET_BOARDS, SET_PANELS, SET_CURRENT_PANEL, SET_TICKETS, EDIT_CURRENT_BOARD, EDIT_BOARDS, EDIT_PANELS, EDIT_CURRENT_PANEL, EDIT_TICKETS, EDIT_CURRENT_TICKET, TOGGLE_DRAWER, TOGGLE_CREATE_BOARD, TOGGLE_EDIT_BOARD, TOGGLE_CREATE_TICKET, TOGGLE_EDIT_TICKET, TOGGLE_EDIT_PANEL, TOGGLE_CREATE_PANEL, ADD_BOARD, ADD_PANEL, ADD_TICKET, EMPTY_PANELS, EMPTY_TICKETS, SET_CURRENT_TICKET, EDIT_TICKET } from './actions';
import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

const defaultState = {
  user: {
  },
  boards: [],

  panels: [],
  tickets: [],
  currentBoard: {
    id: 1,
    board_name: 'benev roosters',
    repo_url: 'https://github.com/Benevolent-Roosters/thesis3',
    owner_id: 3,
    _pivot_user_id: 3,
    _pivot_board_id: 3
  },
  currentTicket: {
  },
  currentPanel: {
  },
  drawerToggled: false,
  createBoardRendered: false,
  editBoardRendered: false,
  createTicketRendered: false,
  editTicketRendered: false,
  createPanelRendered: false,
  editPanelRendered: false
};

const rootReducer = (state = defaultState, action) => {
  switch (action.type) {
    case SET_USER:
      return reduceSetUser(state, action);
    case SET_CURRENT_BOARD:
      return reduceSetCurrentBoard(state, action);
    case SET_CURRENT_PANEL:
      return reduceSetCurrentPanel(state, action);
    case SET_BOARDS:
      return reduceSetBoards(state, action);
    case SET_PANELS:
      return reduceSetPanels(state, action);
    case SET_TICKETS:
      return reduceSetTickets(state, action);
    case EDIT_BOARDS:
      return reduceEditBoards(state, action);
    case EDIT_CURRENT_BOARD:
      return reduceEditCurrentBoard(state, action);
    case EDIT_PANELS:
      return reduceEditPanels(state, action);
    case EDIT_CURRENT_PANEL:
      return reduceEditCurrentPanel(state, action);
    // case EDIT_TICKETS:
    //   return reduceEditTickets(state, action);
    case EDIT_CURRENT_TICKET:
      return reduceEditCurrentTicket(state, action);
    case TOGGLE_DRAWER:
      return reduceToggleDrawer(state);
    case TOGGLE_CREATE_BOARD:
      return reduceToggleCreateBoard(state);
    case TOGGLE_EDIT_BOARD:
      return reduceToggleEditBoard(state);
    case TOGGLE_CREATE_TICKET:
      return reduceToggleCreateTicket(state);
    case TOGGLE_EDIT_TICKET:
      return reduceToggleEditTicket(state);
    case TOGGLE_CREATE_PANEL:
      return reduceToggleCreatePanel(state);
    case TOGGLE_EDIT_PANEL:
      return reduceToggleEditPanel(state);
    case ADD_BOARD:
      return reduceAddBoard(state, action);
    case ADD_PANEL:
      return reduceAddPanel(state, action);
    case ADD_TICKET:
      return reduceAddTicket(state, action);
    case EMPTY_PANELS:
      return reduceEmptyPanels(state);
    case EMPTY_TICKETS:
      return reduceEmptyTickets(state);
    case SET_CURRENT_TICKET:
      return reduceSetCurrentTicket(state, action);
    case EDIT_TICKET:
      return reduceEditTicket(state, action);
    default:
      return state;
  }
};

export const reduceSetUser = (state, action) => Object.assign({}, state, {user: action.value});

export const reduceSetCurrentBoard = (state, action) => Object.assign({}, state, {currentBoard: action.value});

export const reduceSetCurrentPanel = (state, action) => Object.assign({}, state, {currentPanel: action.value});

export const reduceSetBoards = (state, action) => Object.assign({}, state, {boards: action.value});

export const reduceSetPanels = (state, action) => Object.assign({}, state, {panels: action.value});

/** SAME AS reduceAddTicket, BUT REDEFINED FOR SEPARATION OF ACTIONS **/
export const reduceSetTickets = (state, action) => Object.assign({}, state, {tickets: state.tickets.concat(action.value)});

export const reduceAddBoard = (state, action) => Object.assign({}, state, {boards: state.boards.concat(action.value)});

export const reduceAddPanel = (state, action) => Object.assign({}, state, {panels: state.panels.concat(action.value)});

export const reduceAddTicket = (state, action) => Object.assign({}, state, {tickets: state.tickets.concat(action.value)});

export const reduceEditBoards = (state, action) => Object.assign({}, state, {boards: action.value});

export const reduceEditCurrentBoard = (state, action) => Object.assign({}, state, {currentBoard: action.value});

export const reduceEditPanels = (state, action) => Object.assign({}, state, {panels: action.value});

export const reduceEditTicket = (state, action) => Object.assign({}, state, {tickets: state.tickets.map((ticket, i) => i === action.index ? ticket = action.value : ticket)});

export const reduceEditCurrentPanel = (state, action) => Object.assign({}, state, {currentPanel: action.value});

/** SAME AS SETTICKETS CURRENTLY **/
// const reduceEditTickets = (state, action) => Object.assign({}, state, {tickets: action.value});

export const reduceEditCurrentTicket = (state, action) => Object.assign({}, state, {currentTicket: action.value});

export const reduceEmptyPanels = (state) => Object.assign({}, state, {panels: []});

export const reduceEmptyTickets = (state) => Object.assign({}, state, {tickets: []});

export const reduceToggleDrawer = (state) => Object.assign({}, state, {drawerToggled: !state.drawerToggled});

export const reduceToggleCreateBoard = (state) => Object.assign({}, state, {createBoardRendered: !state.createBoardRendered});

export const reduceToggleEditBoard = (state) => Object.assign({}, state, {editBoardRendered: !state.editBoardRendered});

export const reduceToggleCreateTicket = (state) => Object.assign({}, state, {createTicketRendered: !state.createTicketRendered});

export const reduceToggleEditTicket = (state) => Object.assign({}, state, {editTicketRendered: !state.editTicketRendered});

export const reduceToggleCreatePanel = (state) => Object.assign({}, state, {createPanelRendered: !state.createPanelRendered});

export const reduceToggleEditPanel = (state) => Object.assign({}, state, {editPanelRendered: !state.editPanelRendered});

export const reduceSetCurrentTicket = (state, action) => Object.assign({}, state, {currentTicket: action.value});

const combinedReducers = combineReducers({
  routing: routerReducer,
  rootReducer
});

export default combinedReducers;