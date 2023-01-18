// firebase
const db = firebase.firestore();

async function login() {
    let username = document.getElementById("usernameField").value
    let password = document.getElementById("passwordField").value
    console.log(username, password);

    const res = await fetch("http://localhost/hashing",
    {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            parcel: password
        })
    })
    const data = await res.json()

    db.collection("users").get().then((snapshot) => {
        snapshot.docs.forEach(doc => {
            console.log(doc.name);;
        }
        );
    }).catch(err => {
        console.log(err)
    });

}

async function register() {
    let email = document.getElementById("emailField").value
    let username = document.getElementById("usernameField").value
    let password = document.getElementById("passwordField").value
    let confirm = document.getElementById("confirmField").value
    let confirmWarning = document.getElementById("confirmWarning")

    confirmWarning.innerText = (password != confirm) ? "Your confirmation does not match!" : "";

    if ((password == confirm)){

        const now = new Date();

        // console.log(encryptPassword(password));

        const res = await fetch("http://localhost/hashing",
        {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                parcel: password
            })
        })
        const data = await res.json()

        const details = {
            email: email,
            username: username,
            created_at: firebase.firestore.Timestamp.fromDate(now),
            password: data.pass
        };

        console.log(details);
        
        
            db.collection("users").add(details).then(() => {
              console.log("User Added!");
            }).catch(err => {
              console.log(err)
            });

      }
}

async function getInfo() {
    const res = await fetch("http://localhost/info",
        {
            method: 'GET'
        })
        console.log(res);
    const data = await res.json()
    console.log(data);
}

// async function encryptPassword(pass) {
//     const res = await fetch("http://localhost/info",
//         {
//             method: 'POST',
//             headers: {
//                 "Content-Type": "application/json"
//             },
//             body: JSON.stringify({
//                 parcel: pass
//             })
//         })
//     const data = await res.json()
//     console.log(data.pass);
// }