import { pickNeighbour } from '../internal/utils';
import { Selection } from './Selection';

export interface SelectionUIConnectorT {
  handle(itemId: string): SelectionUIPropsT;
}

export type PropsT = {
  selection: Selection;
  onSelect?: (
    selectionParams: {
      itemId: string | undefined;
      isShift?: boolean;
      isCtrl?: boolean;
    },
    mouseEvent?: any
  ) => void;
};

export class SelectionUIConnector implements SelectionUIConnectorT {
  props: PropsT;
  _selectOnMouseUp?: string = undefined;
  _handleMouseUp: any = undefined;
  _handleMouseDown: any = undefined;

  constructor(props: PropsT) {
    this.props = props;
    this._handleMouseDown = this._createMouseDownHandler();
    this._handleMouseUp = this._createMouseUpHandler();
  }

  _select(e: any, itemId: string) {
    const isShift = e.shiftKey;
    const isCtrl = e.ctrlKey;
    const selectionParams = {
      itemId: itemId,
      isShift: isShift,
      isCtrl: isCtrl,
    };
    this.props.selection.selectItem(selectionParams);
    if (this.props.onSelect) {
      this.props.onSelect(selectionParams, e);
    }
  }

  _createMouseDownHandler() {
    return (e: any, itemId: string) => {
      const isSelected = this.props.selection.itemIds.includes(itemId);
      if (!isSelected) {
        this._selectOnMouseUp = undefined;
        this._select(e, itemId);
      } else {
        this._selectOnMouseUp = itemId;
      }
    };
  }

  _createMouseUpHandler() {
    return (e: any, itemId: string) => {
      const isSelected = this.props.selection.itemIds.includes(itemId);
      // If the item was already selected and we left-click it without the ctrl key,
      // then we want to singly select it.
      if (
        this._selectOnMouseUp === itemId &&
        (e.ctrlKey || (e.button == 0 && isSelected))
      ) {
        this._select(e, itemId);
      }
      this._selectOnMouseUp = undefined;
    };
  }

  handle(itemId: any): SelectionUIPropsT {
    const mouseHandlers = {
      onMouseDown: (e: any) => this._handleMouseDown(e, itemId),
      onMouseUp: (e: any) => this._handleMouseUp(e, itemId),
    };

    return {
      isSelected: this.props.selection.itemIds.includes(itemId),
      ...mouseHandlers,
    };
  }
}

export type SelectionUIPropsT = {
  isSelected: boolean;
  onMouseDown?: any;
  onMouseUp?: any;
};

export function selectionUIHandlers<T extends SelectionUIPropsT>(props: T) {
  return {
    onMouseDown: props.onMouseDown,
    onMouseUp: props.onMouseUp,
  };
}

export const createSelectionKeyHandlers = (
  selection: Selection,
  options?: {
    keyDown?: string;
    keyUp?: string;
    getSelectableIds?: () => string[];
  }
) => {
  const down = options?.keyDown ?? 'down';
  const up = options?.keyUp ?? 'up';
  const getAnchor = () => selection.itemIds[selection.itemIds.length - 1];
  const getSelectableIds = () =>
    options?.getSelectableIds
      ? options?.getSelectableIds()
      : selection.selectableIds ?? [];

  return {
    [down]: () =>
      selectNext(selection, getAnchor(), true, false, getSelectableIds()),
    [`shift+${down}`]: () =>
      selectNext(selection, getAnchor(), true, true, getSelectableIds()),
    [up]: () =>
      selectNext(selection, getAnchor(), false, false, getSelectableIds()),
    [`shift+${up}`]: () =>
      selectNext(selection, getAnchor(), false, true, getSelectableIds()),
  };
};

const selectNext = (
  selection: Selection,
  currentItemId: string | undefined,
  isDown: boolean,
  isShift: boolean,
  selectableIds: string[]
) => {
  const selectItemById = (itemId: any) => {
    selection.selectItem({ itemId, isShift, isCtrl: false });
  };
  if (currentItemId !== undefined) {
    pickNeighbour(selectableIds, currentItemId, isDown, selectItemById);
  }
};
