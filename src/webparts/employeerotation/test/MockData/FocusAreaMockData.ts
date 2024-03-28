import { User } from 'common';
import { FocusArea } from 'model/FocusArea';

const FocusAreaArr = [{
    managers: [
        new User(7, "Chaitanya", "Chaitanya@spstudiodev.onmicrosoft.com", "Chaitanya@spstudiodev.onmicrosoft.com", "", 1),
        new User(8, "Jatin", "Jatin@spstudiodev.onmicrosoft.com", "Jatin@spstudiodev.onmicrosoft.com", "", 1),
    ],
    title: "SMB",
    ID: 1,
    Created: new Date("11/12/2020"),
    Modified: new Date("11/12/2020"),
    Author: new User(7, "Chaitanya", "Chaitanya@spstudiodev.onmicrosoft.com", "Chaitanya@spstudiodev.onmicrosoft.com", "", 1),
    Editor: new User(7, "Chaitanya", "Chaitanya@spstudiodev.onmicrosoft.com", "Chaitanya@spstudiodev.onmicrosoft.com", "", 1),
},
{
    managers: [
        new User(7, "Chaitanya", "Chaitanya@spstudiodev.onmicrosoft.com", "Chaitanya@spstudiodev.onmicrosoft.com", "", 1)
    ],
    title: "EDU",
    ID: 2,
    Created: new Date("11/12/2020"),
    Modified: new Date("11/12/2020"),
    Author: new User(7, "Chaitanya", "Chaitanya@spstudiodev.onmicrosoft.com", "Chaitanya@spstudiodev.onmicrosoft.com", "", 1),
    Editor: new User(7, "Chaitanya", "Chaitanya@spstudiodev.onmicrosoft.com", "Chaitanya@spstudiodev.onmicrosoft.com", "", 1),
}];

const toFocusArea = (row: any): FocusArea => {
    let focusArea: FocusArea = null;
    try {
        focusArea = new FocusArea(row.Author, row.Editor, row.Created, row.Modified, parseInt(row.ID, 10));
        focusArea.managers = row.managers;
        focusArea.title = row.title;

    } catch (e) {
        console.warn(e);
    }
    return focusArea;

};

export const getFocusArea = (): FocusArea[] => {
    return FocusAreaArr.map(focusArea => toFocusArea(focusArea));
};
