/* eslint-disable class-methods-use-this */
export default class Comparator<T> {
    public compare(arr: T[], elem: T): boolean {
        return arr.includes(elem);
    }
}
