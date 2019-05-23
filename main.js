window.addEventListener('load', intro);

function intro() {
    // Uvod - sakrij sadržaj kviza, dugme za  pokretanje
    document.querySelector('.main-con').classList.add('none');
    document.querySelector('#pokreniKviz').addEventListener('click', kviz);
}

function kviz() {
    const introContainer = document.querySelector('.contnaslov');
    introContainer.classList.add('none');
    document.querySelector('.main-con').classList.remove('none');
    const container = document.querySelector('#container');
    const tim = document.querySelector('#vreme');
    let pitanja = [];
    let trenutnoPitanje = 0;
    let zbir = 0;

    fetch('pitanja.json')
        .then(res => res.json())
        .then(data => {
            data.forEach(d => {
                pitanja.push([d.pitanje, d.tacan, d.netacan1, d.netacan2, d.netacan3
                ]);
            });
            napraviPitanja();

            function napraviPitanja() {
                // zaustavi kada završi niz pitanja, rezultat, reset brojača:
                if (trenutnoPitanje >= pitanja.length) {
                    kraj();
                    clearInterval(sInt);
                    trenutnoPitanje = 0;
                    zbir = 0;
                    pitanja = [];
                    return false;
                }
                // Pitanja, opcije, random sort opcija, prikaz
                document.querySelector('#naslov').innerHTML =
                     `${trenutnoPitanje + 1} / ${pitanja.length}`;
                const pitanje = pitanja[trenutnoPitanje][0];
                const sveOpcije = [];
                sveOpcije.push(pitanja[trenutnoPitanje][1],
                    pitanja[trenutnoPitanje][2],
                    pitanja[trenutnoPitanje][3],
                    pitanja[trenutnoPitanje][4]);
                container.innerHTML = ''; // prazan container za naredni krug
                let listaOpcija = '';
                sveOpcije.sort(() => Math.random() - 0.5)
                    .forEach(op => {
                    if (op != undefined && op === pitanja[trenutnoPitanje][1]) {
                    listaOpcija += `<label><input type = 'radio'
                        name = 'opcije' id = 't'
                        value = '${op}'><div>${op}</div></label>`
                    } else if (op != undefined) {
                    listaOpcija += `<label><input type = 'radio'
                        name = 'opcije'
                        value = '${op}'><div>${op}</div></label>`;
                    } else if (pitanja[trenutnoPitanje][2] === undefined) {
                    listaOpcija = `<input type = 'text' name = 'opcije'
                        placeholder="unesite odgovor" autofocus>`
                    }
                })
                container.innerHTML +=
                    `<div class = 'pitanje borderR'>${pitanje}<div>`;
                container.innerHTML += listaOpcija;
                container.innerHTML += `<button>Sledeće pitanje</button>`;
                document.querySelector('button')
                   .addEventListener('click', proveriOdgovor);
            }

            // setovanje vremena za kviz; odbrojavanje po sekundu;
            const odbrojOd = new Date().getTime() + 601000;
            const sInt = setInterval(() => {
                    const razlika = odbrojOd - new Date().getTime();
                let minuti = Math.floor(
                    (razlika % (1000 * 60 * 60)) / (1000 * 60));
                    let sekunde = Math.floor((razlika % (1000 * 60)) / 1000);
                    sekunde < 10 ? (sekunde = `0${sekunde}`) : sekunde;
                    minuti < 10 ? (minuti = `0${minuti}`) : minuti;
                    // prikaz odbrojavanja i akcije po isteku vremena
                razlika >= 0 ? tim.innerHTML = `${minuti} : ${sekunde}` :
                    (clearInterval(sInt), kraj(),
                        tim.innerHTML = `Vreme je isteklo!`);
                },
                1000,
                napraviPitanja
            );

            function proveriOdgovor() {
                const opcije =
                    document.querySelectorAll('input[name="opcije"]');
                const txt = document.querySelector('input[type=text]');
                opcije.forEach(op => {
                    let att = op.getAttribute('id');
                    if (att === 't') {
                        op.parentNode.classList.add('tacanBorder');
                    }
                    if (op.checked) {
                        if (att === 't') {
                            zbir++;
                            op.parentNode.classList.add('tacan');
                        } else {
                            op.parentNode.classList.add('netacan');
                        }
                    }
                    if (op = txt) {
                        if (txt.value.toLowerCase() === pitanja[trenutnoPitanje][1]) {
                            zbir++
                            op.classList.add('tacanBorder');
                        } else {
                            op.classList.add('netacanBorder');
                        }
                    }
                });
                console.log(zbir);
                // Naredno pitanje. setTimeout da se prikaže tačnost odgovora
                trenutnoPitanje++;
                setTimeout(function () {
                    napraviPitanja();
                }, 1500);
            }

            function kraj() {
                const procenat =
                    parseFloat((zbir * 100) / pitanja.length).toFixed(2);
                container.innerHTML = `<div class = 'pitanje borderR'>
                Osvojili ste ${zbir} od ${pitanja.length} poena ili
                ${procenat}%</div><a href="index.html">Pokreni ponovo</a>`;
                document.querySelector('#naslov').innerHTML =`Kviz je završen`;
            }
        }).catch(err => {
            console.log(err.message);
            introContainer.classList.remove('none');
            document.querySelector('.main-con').classList.add('none');
            introContainer.innerHTML +=
              `<h1 class = "errorMessage">Request failed, please try again later!</h1>`;
      });
}
