import { CallbackMap, withCbs } from 'aspiration';
import { data, operation, operationExt } from 'skandha';

export type GenericObjectT = any;

export class Addition<T = any> {
  static className = () => 'Addition';

  callbackMap = {} as CallbackMap<{
    add: {
      stageAdd?: () => void;
      createItem?: () => T;
      highlightNewItem?: () => void;
    };
    cancel: {
      unstageAdd(parentId: string | undefined): void;
    };
    confirm: {
      confirmAdd(): void;
    };
  }>;

  @data item?: T;
  @data parentId?: string;

  @operationExt({ log: false }) setParentId(parentId?: string) {
    this.parentId = parentId;
  }

  @operationExt({ log: false }) setItem(item?: T) {
    this.item = item;
  }

  @operation add(args: {
    //
    values?: GenericObjectT;
  }) {
    return withCbs(this.callbackMap, 'add', args, (cbs) => {
      cbs.stageAdd && cbs.stageAdd();
      const newItem = args.values ?? cbs.createItem!();
      this.setItem(newItem);
      cbs.highlightNewItem && cbs.highlightNewItem();
      return newItem;
    });
  }

  @operation confirm() {
    return withCbs(this.callbackMap, 'confirm', {}, (cbs) => {
      const result = cbs.confirmAdd ? cbs.confirmAdd() : undefined;
      return Promise.resolve(result).then(() => {
        this._reset();
      });
    });
  }

  @operation cancel() {
    return withCbs(this.callbackMap, 'cancel', {}, (cbs) => {
      if (this.item) {
        const parentId = this.parentId;
        this._reset();
        cbs.unstageAdd && cbs.unstageAdd(parentId);
      }
    });
  }

  @operationExt({ log: false }) _reset() {
    this.setItem(undefined);
    this.setParentId(undefined);
  }
}
