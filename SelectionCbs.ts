import { Cbs } from 'aspiration';
import {
  SelectionUIConnectorOptionsT,
  SelectionUIConnectorT,
} from './SelectionUIConnector';

export type SelectionParamsT = {
  itemId: string | undefined;
  isShift?: boolean;
  isCtrl?: boolean;
  context?: any;
};

export interface Selection_selectItem extends Cbs {
  selectionParams: SelectionParamsT;
  selectItem(): void;
}

export interface Selection_createUIConnector extends Cbs {
  uiConnectorOptions?: SelectionUIConnectorOptionsT;
  createUIConnector(): SelectionUIConnectorT;
}

export interface SelectionCbs {
  selectItem: Selection_selectItem;
  createUIConnector: Selection_createUIConnector;
}
