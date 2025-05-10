export type Menu = {
  id: number;
  name: string;
  path?: string;
  newTab: boolean;
  submenu?: Menu[];
};
