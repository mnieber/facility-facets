import { mergeDeepLeft, withCbs, type CallbackMap, type Cbs } from 'aspiration';
import { data, operation } from 'skandha';
import { selectionIsInsertedOnDragAndDrop } from '../policies/selectionIsInsertedOnDragAndDrop';
import { HoverPositionT } from './Hovering';

export class DragAndDrop {
  static className = () => 'DragAndDrop';

  callbackMap_ = defaultCallbackMap(this) as CallbackMap<{
    drop?: {
      drop?: () => void;
    };
  }>;

  get callbackMap() {
    return this.callbackMap_;
  }

  set callbackMap(cbs: typeof this.callbackMap_) {
    this.callbackMap_ = mergeDeepLeft(cbs, defaultCallbackMap(this));
  }

  @data isDropping: boolean = false;

  @operation({ log: false }) setIsDropping(isDropping: boolean) {
    this.isDropping = isDropping;
  }

  @operation drop(args: {
    //
    hoverPosition: HoverPositionT;
  }) {
    return withCbs(this.callbackMap, 'drop', args, (cbs) => {
      this.setIsDropping(true);
      return Promise.resolve(cbs!.drop!()).then((response: any) => {
        this.setIsDropping(false);
        return response;
      });
    });
  }
}

export const defaultCallbackMap = (dragAndDrop: DragAndDrop) => ({
  drop: {
    drop: function (this: Cbs<DragAndDrop['drop']>) {
      selectionIsInsertedOnDragAndDrop(dragAndDrop, this.args.hoverPosition);
    },
  },
});
