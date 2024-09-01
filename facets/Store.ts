import { data, operation, output } from 'skandha';
import { listToItemById } from '../internal/utils';

export class Store<T = any> {
  static className = () => 'Store';

  @data declare items?: T[];

  @output get itemById(): { [id: string]: T } {
    return listToItemById(this.items ?? []);
  }

  @operation setItems(items: T[]) {
    this.items = items;
  }
}
