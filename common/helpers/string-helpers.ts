import { names, uniqueNamesGenerator } from 'unique-names-generator';

export class StringHelpers {
  static getRandomHumanName(): string {
    const capitalizedName: string = uniqueNamesGenerator({
      dictionaries: [names],
      style: 'capital',
      length: 1,
    });

    return capitalizedName;
  }
}
