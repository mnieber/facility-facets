import { Cbs, mergeDeepLeft, withCbs, type CallbackMap } from 'aspiration';
import { data, input, operation, output, stub } from 'skandha';
import { range } from '../internal/utils';

export class Selection<T = any> {
  static className = () => 'Selection';

  callbackMap_ = defaultCallbackMap(this) as CallbackMap<{
    selectItem?: {
      selectItem: () => void;
    };
  }>;

  get callbackMap() {
    return this.callbackMap_;
  }

  set callbackMap(cbs: typeof this.callbackMap_) {
    this.callbackMap_ = mergeDeepLeft(cbs, defaultCallbackMap(this));
  }

  @input selectableIds: Array<string> = stub;
  @data itemIds: Array<string> = [];
  @data anchorId?: string;
  @output items: Array<T> = stub;

  @operation selectItem(args: {
    itemId: string | undefined;
    isShift?: boolean;
    isCtrl?: boolean;
    context?: any;
  }) {
    return withCbs(this.callbackMap, 'selectItem', args, (cbs) => {
      cbs!.selectItem();
    });
  }
}

export function handleSelectItem(
  facet: Selection,
  args: {
    itemId: string | undefined;
    isShift?: boolean;
    isCtrl?: boolean;
  }
) {
  if (args.itemId === undefined) {
    facet.itemIds = [];
    facet.anchorId = undefined;
    return;
  }

  const hasItem = facet.itemIds.includes(args.itemId);
  const selectableIds = facet.selectableIds;

  if (!selectableIds) {
    throw Error('logical error');
  }

  if (args.isShift) {
    const startItemId = facet.anchorId || args.itemId;
    const startIdx = selectableIds.indexOf(startItemId);
    const stopIdx = selectableIds.indexOf(args.itemId);
    const idxRange = range(startIdx, stopIdx);
    facet.itemIds = idxRange.map((idx) => selectableIds[idx]);
  } else if (args.isCtrl) {
    facet.itemIds = hasItem
      ? facet.itemIds.filter((x) => x !== args.itemId)
      : [...facet.itemIds, args.itemId];
  } else {
    facet.itemIds = [args.itemId];
  }

  // Move the anchor
  if (!facet.anchorId || !(args.isCtrl || args.isShift)) {
    facet.anchorId = args.itemId;
  }
}

const defaultCallbackMap = (selection: Selection) => ({
  selectItem: {
    selectItem: function (this: Cbs<Selection['selectItem']>) {
      handleSelectItem(selection, this.args);
    },
  },
});
