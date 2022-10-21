import * as fs from 'fs';
import * as path from 'path';

const dataDir = path.resolve(process.cwd(), './dev-data/data');
const filePaths = {
    toursList: dataDir + '/tours-simple.json',
    users: dataDir + '/users.json'
};

const storage = {
    usersList: undefined,
    toursList: undefined
};

export class Database {
    static getUsersList () {
        if (storage.usersList) {
            return Promise.resolve(storage.usersList);
        } else {
            return new Promise((res, rej) => {
                fs.readFile(filePaths.users, {encoding: 'utf8'}, (err, data) => {
                    if (err) {
                        rej(err);
                    } else {
                        storage.usersList = JSON.parse(data);
                        res(storage.usersList);
                    }
                });
            });
        }
    }

    static getToursList () {
        if (storage.toursList) {
            return Promise.resolve(storage.toursList);
        } else {
            return new Promise((res, rej) => {
                fs.readFile(filePaths.toursList, {encoding: 'utf8'}, (err, data) => {
                    if (err) {
                        console.log(err);
                        rej(err);
                    } else {
                        storage.toursList = JSON.parse(data);
                        res(storage.toursList);
                    }
                });
            });
        }
    }

    static updateUsersList (data) {
        const str = JSON.stringify(data);
        storage.usersList = data;
        return new Promise((res, rej) => {
            fs.writeFile(filePaths.users, str, {encoding: 'utf8'}, (err) => {
                err ? rej(err) : res();
            });
        });
    }

    static updateToursList (data) {
        const str = JSON.stringify(data);

        return new Promise((res, rej) => {
            fs.writeFile(filePaths.toursList, str, {encoding: 'utf8'}, (err) => {
                if (err) {
                    rej(err);
                } else {
                    storage.toursList = data;
                    res();
                }
            });
        });

    }
}