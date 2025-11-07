let siswa = ['Andi', 'Susanto', 'Sandi'];

console.log(`Jumlah list : ${siswa.length}`)

siswa.forEach(function(nama){
    let jumlahHuruf = nama.length;
    console.log(`${nama} = ${jumlahHuruf} huruf`)
});

