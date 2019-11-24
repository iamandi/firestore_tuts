
//console.log('Before');
//getUser(1, getRepositories);

function getRepositories(user){
    getRepositories(user.githubUsername, getCommits);
}

function getCommits(repo){
    getCommits(repo, displayCommits);
}

function displayCommits(commits) {
    console.log('Commits',commits);
}

function getUser(id, callback) {
    setTimeout(() => {
        console.log('Reading from DB');
        callback({ id: id, githubUsername: 'andy' });
    }, 2000);
}

function getRepositories(user, callback) {
    setTimeout(() => {
        callback(['repo1', 'repo2', 'repo3']);
    }, 2000);
}

function getCommits(repo, callback) {
    setTimeout(() => {
        callback(['commit1', 'commit1', 'commit1']);
    }, 2000);
}



//////
function getData1() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log('data1');
        }, 1000);
    });
}


function getData2() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log('data2');
        }, 2000);
    });
}

function getData3() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log('data3');
        }, 3000);
    });
}

async function tester1(){
    //const data1 = await getData1();
    //console.log(data1);
    console.log('1');
    const data1 = await getData1();
    console.log('2');
    const data2 = await getData2();
    console.log('3');
    const data3 = await getData3();
}

async function tester2(){
    //const data1 = await getData1();
    //console.log(data1);
    //console.log('1');
    console.log('2');
    const data2 = await getData2();
    return data2;
    console.log('3');
    const data3 = await getData3();
    
}

//tester2();
tester1();

async function addTester(){
    const d1 = await tester1();
    const d2 = await tester2();
    console.log(d1+d2);
}
//addTester();