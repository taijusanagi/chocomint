// SPDX-License-Identifier: MIT
pragma solidity ^0.5.17;
pragma experimental ABIEncoderV2;

// solidity 0.5.17 is used, because this contract uses @openzeppelin/contracts@2.5.1 for gas efficiency

import "@openzeppelin/contracts/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "hardhat/console.sol";

// This contract is created by taijusanagi(taijusanagi.eth), I hope this contract is used for all NFT lovers
// Chocomint is named by Kenta Suhara(suhara.eth)
// AA is created by Daiki Kunii
// rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr
// rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr
// rrrtrrrtrrrtrrrtrrrtrrrtrrrtrrrtrrrtrrrtrrrtrrrtrrrtrrrtrrrtrrrtrrrtrrrtrrrtrrrtrrrtrrrtrrrtrrrtrrrtrrrtrrrtrrrtrrrtrrrtrrrtrrrtrrrtrrrtrrrtrrrtrrrtrrrtrrrtrrrtrrrtrrrtrrrtrrrtrrrtrrrtrrrtrrrtrrrtrrrr
// rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrtrr
// rrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrrrr
// rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrtr
// rrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrrrr
// rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrtrrrr
// rrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrrrrtrr
// rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrtrrrrrrr
// rrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrrrrtrrtrr
// rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrtrrrrrrrrrr
// rrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrrrrtrrtrrtrr
// rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrtrrrrrrrrrrrrr
// rrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrrrrtrrtrrtrrtrr
// rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrtrrrrrrrrrrrrrrrr
// rrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrrrtOOOOzzz1zzzzOOOOrrrrrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrrrtrrtrrtrrtrrtrr
// rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrOOz1<<<<<<<<<<<<<<<<<<<+1zOOrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr
// rrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrrOOv1<<<<<~~~```         ``_~~<<<<+1zOrrrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrr
// rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrOOz1<<<<~` `                    `  _~<<<+zOwrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr
// rrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrrrOIz<<<~`  `  `` ` `   `      ` ``  ` ``` _<<<1zOrrrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrr
// rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrOz<<<!`````` ``  ``` `` `` ```` `` `` ``````` ~<<+zOrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr
// rrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrwOz1><~ ````` ``````` `` ``  `` `` `` ```` ` ``````_<<1zOwrrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtr
// rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrZv1?<~.``````````````````` `````` ``````````````````.._<+1zOvrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr
// rrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrwOz?<~...`.`````` ...`````````````````````` .. ```````...._<?zOwrrrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrr
// rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrvZO=?<~.......``..(gNNHa- `````````````````.(gNNmx- `...`...._<+=zwvrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrtr
// rrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrvZIz?<~~.........-jMMMHMMNx.``````````````.(dMMHHMMN-.........~~~+=zwvrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrrrr
// rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrvZl=<<~~~~~.......(MHHpppHM@_.`..`.`.`..`...jMHHppHHMP.......~~~~~~+=lwzrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrtrrr
// rrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrrvwt=z<~~~~~~~~.....(HHbpppkHD_..`..`..`.`..``JMHppppqH$.....~~~~~~~~(1=lwwrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrrrrr
// rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrtrwwtl=<:::~~~~~~~~....?MHUUYYY! ................7TYUWHH8~..~~~~~~~~~:::<1ltwvrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrtrr
// rrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrrrrzwt=<;::::~~~~~~~~~~._............................--...~~~~~~~~~~~:::::+=twzrrrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrrrrr
// rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrtrrrwXrl=>;;:::::~~~~~~~~~~~.~.~....................~..~~.~~~~~~~~~~~::::::;>1lrwXrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrtrrtrr
// rrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrrrrrruvtlz>;;:::::::~~~~~~~~~~~~~~~~~~....____...~.~~~~~~~~~~~~~~~~~:::::::;;>?ltvuvrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrrrrrrrr
// rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrtrrrtrwuvtl?>>;;;:::::::~~~~~~~~~~~~~~~~~_(x<__<o_~~~~~~~~~~~~~~~~~::::::::;;;>>?ltruXrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrtrrrtrrtr
// rrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrrrrrtrrwurtl??>>;;;:::::::::~~~~~~~~~~~~~~(WC_.._z<~~~~~~~~~~~~~~:::~:::::::;;>>??ltruXrrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrrrrtrrrrr
// rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrtrrrtrrrrXuvtl=?>>>;;;;::::::::::~:~~~~~~~~~jH>_.._j>~~~~~~~~~~:~:::~:::::::;;;>>>?=ltruurrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrtrrrrrrr
// rrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrrrrrtrrrrruuvtl=??>>;;;;:::::::~:::~:~:~~~(++dH>_.._zA&&+_~~~:~:~::~::::::::;;;;>>??=ltvuZrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrrrrtrrt
// rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrtrrrtrrrrrrrXZzrll??>>>;;;;;:::::::~::~:::~~_?MM#<_..(dM#M9~::~:::~::::::::::;;;;>>>??=lrvuZrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrtrrrrrr
// rrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrrrrrtrrrrtrrrXZzrtl=??>>;;;;;:::::::::::~:::::~_dR<~..(ZC~__::~:~:::~::::::::;;;;;>>>?=ltrzZXrrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrrtrrrr
// rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrtrrrtrrrrrrrrrrwZuvtl==?>>>;;;;;:::::::::::~~:~::(dR<~.~(O>~::~::::~::::::::::;;;;;>>>??=ltruZ0rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrtrrr
// rrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrrrrrtrrrrtrrtrrrwyZzrtl=??>>>;;;;;;:::::::~::::~::+WS<_~_(O<((_:~:::::::::::::;;;;;>>>??=ltrzuyXrrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrrtr
// rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrtrrrtrrrrrrrrrrrtrrXXuvtll=??>>>;;;;;;::::::::::::~:zWC<<<<<<<<?zy<::::::::::::;;;;;>>>??=lltvuXXvrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr
// rrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrrrrrtrrrrtrrtrrrrrrrwyZzrtll=???>>>;;;;;:::::::::::+xv<<~~~~__~<__(X<:::::::::;;;;;>>>>??==ltrzXy0rrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrrrtrr
// rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrtrrrtrrrrrrrrrrtrrtrrrrXyuzrtl==???>>>;;;;;;;::::::<jC<:~~~_~____(1<(zw<::::::;;;;;>>>>???=lltrzuySrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrtrrrrr
// rrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrrrrrtrrrrtrrtrrrrrrrrrrrwXyuzrtll=???>>>>>;;;;;;;::+Oz<~_~......_<<<1<<wc::;<<;;;;>>>>>???=lltrzuyXXrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrrrtrrr
// rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrtrrrtrrrrrrrrrrtrrtrrtrrtrrwWyuurtll==????>>>>;;;;;;jXC<~~.~~~~.~.._<<+z;zw+zz<<1z>>>>>???==lltrzuZy0rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrtrr
// rrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrrrrrtrrrrtrrtrrrrrrrrrrrrrrrrwyyuuvrtl===???>>>>>>;;+WC<~~~.~~___~~~~_+?Oz>d0<~~~(z+>>???===lttrzuyy0rrrrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrrr
// rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrtrrrtrrrrrrrrrrtrrrtrrtrrtrrrrrrZWyZuvrtlll==?????>>>+dS<~~~~~~(+dZ_~~~(jzzz+w>~~~(dHI???===lltrvuZyy0rrrtrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr
// rrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrrrrrtrrrrtrrtrrrrrrtrrrrrrrrtrrrrrwWWZuzrrtll===?????>jKI<~~~.~~(1XC~~~_+wOwOzC<~_(dM0??===lltrrzuZyXVrrrrrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrr
// rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrtrrrtrrrrrrrrrrtrrrtrrrrtrrtrrrrtrrrrrXyZZuzrrtlll===??1d0<:~~~~~~:+w>:~_+zZwXwZ<~(jMH0===llltrrvuuZy0rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr
// rrtrrtrrtrrtrrtrrtrrtrrtrrtrrrrrrtrrrrtrrtrrrrrrtrrrrrrrrrrrrrrtrrrrrwWWZuuvrrttlll==dKI<~~~.~~~(+XA+(+zzwWH6<:(dM8I=llltttrvzuZyXXrrrrrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrr
// rrrrrrrrrrrrrrrrrrrrrrrrrrrtrrrtrrrrrrrrrrtrrrtrrrrtrrtrrtrrtrrrrrrrrrrXWWZuuzvrttllzXSz<~~~~~~::+dHHNNHHH9C<:+dMKOlllttrrzuuZXX0rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr
// rrtrrtrrtrrtrrtrrtrrtrrtrrrrrrtrrrrtrrtrrrrrrtrrrrrrrrrrrrrrrrrrtrrrrrrrrXWWZZuzzrrrdq0z:~~~~~~::<zZWMMMH0z:(jWMH0tttrrvzuuXXXUrrrrrrrrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrr
// rrrrrrrrrrrrrrrrrrrrrrrrtrrrtrrrrrrrrrrtrrrtrrrrtrrtrrtrrtrrtrrrrrrtrrrrrrrwUyXZuuzzXHk<:~~~~~~::;1zwUHHZ<>+jWMgHXrvvzuuZXVUVrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrtrr
// rrtrrtrrtrrtrrtrrtrrtrrrrrrtrrrrtrrtrrrrrrtrrrrrrrrrrrrrrrrrrtrrtrrrrrrrrrrrrrXUWWXZWHkz::~~~~:::;>=twWSz11dM@@HWuuuXXXVU0rrrrrrrrrrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrrrrr
// rrrrrrrrrrrrrrrrrrrrrtrrrtrrrrrrrrrrtrrrtrrrrtrrtrrtrrtrrtrrrrrrrrrrrrrrrrrrrrrrrwXWHHkz::~~:::::;?=lwXOlQHHH@@HWXXVXUwrrrrrrrrrrrtrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrtrrrtr
// rrtrrtrrtrrtrrtrrtrrrrrrtrrrrtrrtrrrrrrtrrrrrrrrrrrrrrrrrrtrrrtrrtrtrrtrrrrrrrrrrrrrwWkI<::~::::;>?ltrrAd#HHHMMHUUwrrrrrrrrrrrrrrrrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrrrrrrtrr
// rrrrrrrrrrrrrrrrrrtrrrtrrrrrrrrrrtrrrtrrrrtrrtrrtrrtrrtrrrrrrtrrrrrrrrrrrrrrrrrrrrrrrZWkz<::::;++zzwwwWHH9UUXrrrrrrrrrrrrrrrrrrtrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrtrrtrrrrrr
// rrtrrtrrtrrtrrtrrrrrrtrrrrtrrtrrrrrrtrrrrrrrrrrrrrrrrrrtrrrtrrrrtrrrtrrtrrtrrrrrrrrrrrwUkz++++zzwwuXrrrrrrrrrrrrrrrrrrrrrrrrrtrrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrrrrrrrtrrrr
// rrrrrrrrrrrrrrrtrrrtrrrrrrrrrrtrrrtrrrrtrrtrrtrrtrrtrrrrrrtrrrrrrrtrrrrrrrrrtrrtrrrrrrrrrwzvvzvvrrrrrrrrrrrrrrrrrrrrrrrrrtrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrtrrtrrrrrrtrr
// rrtrrtrrtrrtrrrrrrtrrrrtrrtrrrrrrtrrrrrrrrrrrrrrrrrrtrrrtrrrrtrrrrrrrtrrtrrrrrrrrrtrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrtrrtrrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrrrrrrtrtrrrrrr
// rrrrrrrrrrrrtrrrtrrrrrrrrrrtrrrtrrrrtrrtrrtrrtrrtrrrrrrtrrrrrrrtrrrtrrrrrrtrrtrrrrrrtrrrrrrrrrrrrrrrrrrrrrrrrrrrrtrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrtrrrtrrrrrrtrrtr
// rrtrrtrrtrrrrrrtrrrrtrrtrrrrrrtrrrrrrrrrrrrrrrrrrtrrrtrrrrtrrrrrtrrrrrtrrrrrrrtrtrrrrrtrrtrrrrrrrrrrrrtrrrtrrtrrrrrrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrZ7?1rrtrrtrrtrrtrrtrrtrrtrrrrrrtrrrrrrrrrrrr
// rrrrrrrrrtrrrtrrrrrrrrrrtrrrtrrrrtrrtrrtrrtrrtrrrrrrtrrrrrrrtrrrrrtrrrrrtrrtrrrrrrtrrrrrrrrtrtrrtrrtrrrrrrrrrrrtrrtrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrt~``.rrrrrrrrrrrrrrrrrrrrrtrrrtrrrrtrtrrtrrrr
// rrtrrtrrrrrrtrrrrtrrtrrrrrrtrrrrrrrrrrrrrrrrrrtrrrtrrrrtrrrrrtrrrrrtrrrrrrrrrrrrrrrtrrtrrrrrrrrrrrrrrrrtrrtrrrrrrrrrtrrtrrtrrtrrtrrtrrtrrtrrtrv??Otrrtrrtrrv` `(rrrrtrrtrrtrrtrrtrrrrrrrtrrrrrrrrrrrtrrt
// rrrrrrtrrrtrrrrrrrrrrtrrrtrrrrtrrtrrtrrtrrtrrrrrrtrrrrrrrtrrrrrtrrrrrtrrtrrtrrtrrtrrrrrtrrtrrrtrrtrrtrrrrrrtrtrrtrrrrrrrrrrrrrrrrrrrrrrrrrrrrZ ``(rrrrrrrrr{`` wvrrrrrrrrrrrrrrrrtrrtrrrrrrtrrrtrrrrrrrr
// rrtrrrrrrtrrrrtrrtrrrrrrtrrrrrrrrrrrrrrrrrrtrrrtrrrrtrrrrrtrrrrrtrrrrrrrrrrrrrrrrrrrrrrrrrrrtrrrrrrrrrtrrrrrrrrrrrtrrtrrtrr7??Orrtrrtrrtrrtrr>`` zvrrrtrrtr```.rrrrrrtrrtrrtrrtrrrrrrrtrrrrrrtrrrtrrtrrr
// rrrtrrrtrrrrrrrrrrtrrrtrrrrtrrtrrtrrtrrtrrrrrrtrrrrrrrtrrrrrtrrrrrtrrtrrtrrtrrtrrtrrtrrtrrrrrrrtrrtrrrrtrrtrrrtrrrrrrrrrrrI```.rrrrrrrrrrrrrr: `.COrrrrrrrv`  Jrrrrrrrrrrrrrrrrrrrtrrrrrtrrrrrrrrrrrrtrr
// rrrrrrtrrrrtrrtrrrrrrtrrrrrrrrrrrrrrrrrrtrrrtrrrrtrrrrrtrrrrrtrrrrrrrrrrrrrrrrrrrrrrrrrrtrrtrrrrrrrrtrrrrrrrtrrrtrrtrrtrrrro(JrvrrrtrOOrtrZ!`````` jrrrtrr{``.vvrrrrtrrtrrtrrtrrtrrrtrrrrtrtrrtrrtrrrrrr
// rrtrrrrrrrrrrrrtrrrtrrrrtrrtrrtrrtrrtrrrrrrtrrrrrrrtrrrrrtrrrrrtrrtrrtrrtrrtrrtrrtrrtrrrrrrrrtrrtrrrrrrrtrrrrrrrrrrrrrrrtrOvOrrrC` ``` `(Ol..```(xwvrrrrtt```(vvrrrrrrrrrrrrrrrrrrrrrrrtrrrrrrrrrrtrrrtr
// rrrrtrrrtrrtrrrrrrtrrrrrrrrrrrrrrrrrrtrrrtrrrrtrrrrrtrrrrrtrrrrrrrrrrrrrrrrrrrrrrrrrrtrrtrrrrrrrrrtrrtrrrrtrrtrrZ7777OrrrZ```jrO_`` .-```,rr:` .vrrrZCOrrI`` yvrrrrtrrtrrtrrtrrtrrtrrrrrrrrrtrrtrrrrrtrr
// rrrrrrrrrrrrtrrrtrrrrtrrtrrtrrtrrtrrrrrrtrrrrrrrtrrrrrtrrrrrtrrtrrtrrtrrtrrtrrtrrtrrrrrrrtrtrrtrrrrrrrrZ<?<```_!````` jrr{`` wrC` `(rC```(vZ ``,vrr>``.rrr&(jvrrrrrrrrrrrrrrrrrrrrrtrrtrrtrrrrrrrrrtrrrr
// rtrrtrrtrrrrrrrtrrrrrrrrrrrrrrrrrrtrrrtrrrrtrrrrrtrrrrrtv` ?rrrrrrrrrrrrrrrrrrrrrrtrrrtrrrrrZ7!!~?1trrr!```..`` .Jw` `.rr!``.rr}`` wv}`  wrC```JvvZ```JrZ>!?Orrrrrtrrtrrtrrtrrtrrrrrrrrrrrrtrrtrrtrrrrrr
// rrrrrrrrtrrtrrrrrrtrrtrrtrrtrrtrrrrrrtrrrrrrt7!````.?rrr!``.rrrrtrrtrrtrrtrrtrrtrZ7?!??Orrt!```. ``.OrI ` .rI```(rC```(vZ ``(vO~``.zO_``.vZ!`  ?O7`` (rrl```,rrrrrrrrrrrrrrrrrrtrrtrrtrrtrrrrrrrrrrrtrrr
// rrrtrrrrrrrrrtrrrrrrrrrrrrrrrrrtrrrtrrrrtrrZ```` `` `(rZ ``(rrrrrrrrrO7<???1rrrr>`````` zr{``.zvI```(r{`` zr{`  Ov{``.wr{`` zvC`` (zw.``.! ``````` .JrrvrO+zvvrrrrrtrrtrrtrrtrrrrrrrrrrrrrrrtrrtrrtrrrtr
// rrrrtrtrrtrrrrrtrrtrrtrrtrrtrrrrrrtrrrrrrrr!```.rI```.r{```????Orrtr> `` ```.Or>```(Z```(v~``.r7!`` yr!``.zv~``.vr```.rC``  ?!``` zzvo. ` ..wwz++zrvvrrrrrrrrrrrrrrrrrrrrrrrrrrrtrrtrrtrrtrrrrrrrrrrrrrr
// rrtrrrrrrrrtrrrrrrrrrrrrrrrrtrrrtrrrrtrrtrI ``.rvw.`.Jr: ` ```` jrr>`` jvI```(r:`  ww...rZ` `(2``` (7!`` -zI ``(vv-`   ``. ```...Jzvrrrrrrvrrrrrrrrrrrrrrrrrrrrrrtrrtrrtrrtrrtrrrrrrrrrrrrrtrrtrrtrrtrrr
// rrrrrrrtrrrrrrtrrtrrtrrtrrrrrrrtrrrrrrrrrr{```,vrrrrrrZ```.zZ` `(rr!``.rC!`  zO```.vrrrrr>`` wv+`````````Jv}`` wvrr&....urvrvrrrvvvrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrtrrtrrtrrtrrrrrrrrrrrrrrr
// rrrtrrrrrtrrrrrrrrrrrrrrtrrtrrrrrrtrrtrrrr:`` Jrrrrrrr>`` jvC```JvZ ` (2````.C!```.wvrOv!````_!`` .zwl``.vrw((zvrrrrrrvvrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrtrrtrrtrrtrrtrrtrrtrrrrrrrrrrrrrrrrtrrtrrtrrtrr
// rrrrrtrrrrrtrrtrrtrrtrrrrrrrrtrrrrrrrrtrrZ ` .rvrrrrrr: `.vr:``.rr{`` vw+` ```  ```` ````.J-.....Jvrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrtrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrtrrtrrtrrtrrtrrrrrrrrrrrrrr
// rrtrrrrtrrrrrrrrrrrrrtrrtrrrrrrtrrtrrrrrr>```,vrrrrrrv ``,vv`` .vC ```_!```.&zrvw-.....Jwvrvvvvvvvrvrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrtrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrrrrrrrrrrrrrrrtrrtrrtrrtrrr
// rrrrrrrrrtrrtrrtrrtrrrrrrtrtrrrrrrrtrrtrrl` `-wrrrrZ> `` Jvv-``````...` ..Jvvrrrrrrrvvvrvrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr>(rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrtrrtrrtrrtrrrrrrrrrrrrrtrr
// rrtrrtrrrrrrrrrrrrrrrrtrrrrrrtrrtrrrrrrrtO-```` ~~```` `.vvrro-..JzrrrvvvvvvrrrrrrrrrrrrrrrrrrrrrrrrrrtrrrrrrrrrrtrrtrZ!_<(rrtrtrr~jrrrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrrrrrrrrrrrtrrtrrtrrtrrrrr
// rrrrrrtrrtrrtrrtrrtrrrrrrrrrrrrrrrrrtrrrrrro-. `` ..(wo+wvvrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrtrrrrOrrrtrrtrrrrrrt>(C~?O>(rrrI(rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrtrrtrrtrrrrrrrrrrrrrrrrtr
// rrtrrrrrrrrrrrrrrrrtrrtrrtrrtrrtrrtrrrtrrrrrrrrvvvvrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrtrrtrrrrrtrZ~jrrZ7zrrrZ~(_O<(C_w>~-?>(Izrrrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrrrrrrrrrrtrrtrrtrrtrrtrrrr
// rrrtrrtrrtrrtrrtrrrrrrrrrrrrrrrrrrrrrrrrtrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrtrZOI_OtrtrrrrrrOOrv<<j2_-(Z~<~v1r>(C(C~zl_!((-(Jrzzrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrtrrtrrtrrrrrrrrrrrrrrrrrrrrr
// rrrrrrrrrrrrrrrrtrrrtrrtrrtrrtrrtrrtrrrrrtrtrrrrrrrrrrrrrrrrrrtrrrrrrrZ77v<<1rrrt~jOwC1rrrrZ_-.J~z~j~(>(-({_+7(jr+Jw+/(rrrrrrrrrrrrrrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrrrrrrrrrrtrtrrtrrtrrtrrtrrtrrt
// rrtrrtrrtrrtrrrrrrrtrrrrrrrrrrrrrrrrtrrtrrrrrtrrtrrrrrrrrrrtrrrrrtrrtO(+o__~J7<?-_JrZ~(zvurl(C(I_C.<-_(JOJJwOrrrrrrrr:(rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrtrrtrrtrrrrrrrrrrrrrrrrrrrrrrrrr
// rrrrrrrrrrrrtrrtrrrrrrtrrtrrtrrtrrrrrrrrrrrrrrrrrrtrrtrrtrrrrrrrrrrrrrrOI~zrC_<(>(Z~_(:_(wriJoJrOwvrrrrrrrrrrrrrrrrrrrrrrrrrrrrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrrrrrrrrrtrrtrrrtrrtrrtrrtrrtrrtrr
// rrtrrtrrtrrrrrrrrtrrrrrrrrrrrrrrtrrtrrtrrtrrtrrtrrrrrrrrrrrrtrtrrtrrrI~J<.?<--<(J(JOrOOrrrrrrrrrrrrrrrrrrrrrrrrrrtrrtrrrrrrtrrtrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrtrrtrrtrrrrrrrrtrrrrrrrrrrrrrrrrrrr
// rrrrrrrrrtrrtrrrrrrtrrtrrtrrtrrrrrrrrrrrrrrrrrrrrrrtrrtrrtrrrrrrrrtrrt+(Jwrrrrrrrrrrrrrrrrrrrrtrrrrrrrrrrrrrrrtrrrrrrrrtrrrrrrrrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrrrrrrrrtrrtrrrrrrrtrrtrrtrrtrrtrrtr
// rrtrrtrrrrrrrtrtrrrrrrrrrrrrrtrrtrrtrrtrrtrrtrrtrrrrrrrrrrrtrrrtrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrtrrtrrrrrrtrrtrrrrrtrrrrrrtrrtrrtrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrtrrtrrrrrrtrrtrrrrrrrrrrrrrrrrrrrr
// rrrrrrtrrrtrrrrrrtrrtrrtrrtrrrrrrrrrrrrrrrrrrrrrtrrtrrtrrrrrrtrrrrrtrrrrrrrrrrrrrrrrrrrrrrtrrtrrrrrrrtrrrrrrrrrtrrrtrtrrrrrrrrrrrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrrrrrrrrtrrrrrrrtrrtrrtrrtrrtrrtrrr
// rrtrrrrrrtrrrrrrrrrrrrrrrrrrrrtrrtrrtrrtrrtrrtrrrrrrrrrtrtrrrrrrtrrrrtrrtrrrrrtrrtrrtrrtrrrrrrrrrtrrrrtrrtrrtrrrrrrrrrtrrtrrtrrtrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrtrrtrrtrrrrrtrrrrrrrrrrrrrrrrrrrrtr
// rrrtrrrtrrrrtrtrrtrrtrrtrrtrrrrrrrrrrrrrrrrrrrrrrtrrtrrrrrrtrrrrrrtrrrrrrrtrrrrrrrrrrrrrrtrrtrrtrrrtrrrrrrrrrrrtrrtrrrrrrrrrrrrrrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrrrrrrrrrrrrtrrrrtrrtrrtrrtrrtrrtrrrrr
// rrrrrrtrrrrrrrrrrrrrrrrrrrrtrrtrrtrrtrrtrrtrrtrrrrrrrrrrrrrrtrrtrrrrrrtrrrrtrrtrrtrrtrrrrrrrrrrrrrrrrrrtrrtrrtrrrrrrrtrrtrrtrrtrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrtrtrrtrrtrrtrrrtrrrrrrrrrrrrrrrrrrrtrrr
// rrtrrrrrrtrrrtrrtrrtrrtrrrrrrrrrrrrrrrrrrrrrrrtrrtrrtrrtrrtrrrrrrrrtrrrrtrrrrrrrrrrrrtrtrrtrrtrrtrrtrrrrrrrrrrrrtrrrrrrrrrrrrrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrrrrrrrrrrrrrrrrrrrrrtrrtrrtrrtrrtrrrrrrr
// rrrrtrrrrrrtrrrrrrrrrrrtrrtrrtrrtrrtrrtrrtrrrrrrrrrrrrrrrrrrrrtrrtrrrtrrrrrrtrrtrrtrrrrrrrrrrrrrrrrrtrrtrrtrrtrrrrtrrtrrtrrtrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrtrrrtrrtrrtrrtrrtrrtrrrrrrrrrrrrrrrrtrrtrr
// rrrrrrtrrrrrrrtrrtrrtrrrrrrrrrrrrrrrrrrrrrtrrtrrtrrtrrtrrtrrtrrrrrrrrrrrrtrrrrrrrrrrrrrrtrrtrrtrrtrrrrrrrrrrrrrrrrrrrrrrrrrrtrrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrrrrtrrrrrrrrrrrrrrrrrtrrtrrtrrtrrtrrrrrrrr
// rtrrrrrtrtrrrrrrrrrrrrrrtrrtrrtrrtrrtrrtrrrrrrrrrrrrrrrrrrrrrrrtrrtrrtrrrrrtrrtrrtrrtrrtrrrrrrrrrrrrrtrrtrrtrrtrrtrrtrrtrrrrrrrtrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrtrrrrtrrtrrtrrtrrtrrrrrrrrrrrrrrrrrrtrrtr
// rrrtrrrrrrrtrrtrrtrrtrrrrrrrrrrrrrrrrrrrrrrtrrtrrtrrtrrtrrtrrtrrrrrrrrtrrrrrrrrrrrrrrrrrrrtrrtrrtrrtrrrrrrrrrrrrrrrrrrrrtrrtrrrrrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrrrrrrrrrrrrrrrrrrrrrtrrtrrtrrtrrtrrrrrrr
// rrrrtrrrtrrrrrrrrrrrrtrrtrrtrrtrrtrrtrrtrrrrrrrrrrrrrrrrrrrrrrrrtrrtrrrrtrrtrrtrrtrrtrrrrrrrrrrrrrrrrrtrrtrrtrrtrrtrrtrrrrrrrtrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrtrrtrrtrrtrrtrrtrrtrrrrrrrrrrrrrrrtrrtrr
// rrrrrrtrrrrrtrrtrrtrrrrrrrrrrrrrrrrrrrrrtrrtrrtrrtrrtrrtrrtrrtrrrrrrrrrrrrrrrrrrrrrrrtrrtrrtrrtrrtrrtrrrrrrrrrrrrrrrrrrrrtrrrrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrtrrrrrrrrrrrrrrrrrrrrrrrtrrtrrtrrtrrrrrrrrr
// rrtrrrrrrtrrrrrrrrrrrrtrrtrrtrrtrrtrrtrrrrrrrrrrrrrrrrrrrrrrrrrrtrrtrrtrrtrrtrrtrrtrrrrrrrrrrrrrrrrrrrrtrrtrrtrrtrrtrrtrrrrtrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrtrrtrrtrrtrrtrrtrrtrrrrrrrrrrrrrtrrtrrtr

// I beleive ERC721 is more suitable than ERC1155
// I will create ERC1155 for "chocoprint" later
// In Chocomint, ERC721 is the original NFT and ERC1155 is the copy NFT (kind of printed NFT)
// Chocomint stands for chocolate + peppermint, this provides a simple experience for minting NFTs, and it tastes like a chocomint
contract Chocomint is ERC721 {
  // SafeMath is used instead of Counter for simplicity
  using SafeMath for uint256;

  // ECDSA is used for signature verification
  using ECDSA for bytes32;

  event Mint(
    bytes32 indexed ipfsHash,
    address indexed creator,
    address indexed minter,
    address receiver,
    uint256 tokenId,
    uint256 price
  );

  /**
   * @dev this is used for dulication check
   *      bytes32hash(ipfsHash, creatorAddress) is used for simplicity
   */
  mapping(bytes32 => uint256) public publishedTokenId;

  /**
   * @dev this ipfsHash is for tokenURI, used bytes32 ipfs content digest instead of string ipfs cid for gas efficiency
   *      this metadata can be any kind of json data for future compatibility
   *      it guarantees persistance of token metadata, it will not changed with help of IPFS
   *      if invalid ipfs digest is entered, NFT still can be published, but metadata is completely invalid, who needs that NFT?
   *      you can try to publish invalid NFT, but you will just loose your money
   */
  mapping(uint256 => bytes32) public ipfsMemory;

  /**
   * @dev creator is kept for validation
   */
  mapping(uint256 => address) public creatorMemory;

  /**
   * @dev minter is great role to publish NFT in blockchain so it kept as minter
   */
  mapping(uint256 => address) public minterMemory;

  /**
   * @dev total suplly is implemented for etherscan display
   */
  uint256 public totalSupply;

  /**
   * @dev ERC721Metadata is not used, because tokenURI is original logic
   *      so name and symbol is impemented here
   */
  string public name;
  string public symbol;

  constructor(string memory _name, string memory _symbol) public {
    name = _name;
    symbol = _symbol;
  }

  /**
   * @dev I guess it is possible to mint to NFT to differenct account from creator/minter for business user
   *      so minter and receiver is different
   *      sometime frontrunner can make same nft, but in that case creator is invalid, so NFT is published but NFT can be validated as fake
   */
  function _mint(
    bytes32 _ipfs,
    address _creator,
    address _minter,
    address _receiver
  ) internal returns (uint256) {
    // chainId and contract address is not required in hash
    bytes32 hash = keccak256(abi.encodePacked(_ipfs, _creator));
    require(
      publishedTokenId[hash] == 0,
      "The NFT of this ipfsHash and creator is already published"
    );
    address receiver = _receiver == address(0x0) ? msg.sender : _receiver;
    totalSupply = totalSupply.add(1);
    ipfsMemory[totalSupply] = _ipfs;
    creatorMemory[totalSupply] = _creator;
    minterMemory[totalSupply] = _minter;
    super._mint(receiver, totalSupply);
    publishedTokenId[hash] = totalSupply;
    return totalSupply;
  }

  /**
   * @dev creator and minter is msg.sender, and it cannot be input, because creator and minter should be signature verified
   */
  function mint(bytes32 _ipfs, address _receiver) public {
    uint256 price = 0;
    address creator = msg.sender;
    address minter = msg.sender;
    uint256 tokenId = _mint(_ipfs, creator, minter, _receiver);
    emit Mint(_ipfs, creator, minter, _receiver, tokenId, price);
  }

  /**
   * @dev creator just sign the content creation(ipfsHash, price) and delegate minting to others
   *      case1: creator get NFT, this is like minter just help creator to mint
   *      case2: minter get NFT, this is like cloud sale of premint NFT
   *      minter cannnot be input because minter should be signature verified
   */
  function pairmint(
    bytes32 _ipfs,
    address payable _creator,
    address _receiver,
    bytes32 _root,
    bytes32[] memory _proof,
    bytes memory _signature
  ) public payable {
    // chainId and contract address is required for reduce risk
    // nonce is not required because same ipfsHash and creator NFT will be considered as invalid nexttime.
    uint256 price = msg.value;
    address minter = msg.sender;
    bytes32 hash =
      keccak256(
        abi.encodePacked(_getChainId(), address(this), _ipfs, price, _receiver)
      );
    bool hashVerified = MerkleProof.verify(_proof, _root, hash);
    require(hashVerified, "The hash must be included in the merkle tree");
    require(
      _root.toEthSignedMessageHash().recover(_signature) == _creator,
      "The signer must be valid for the creator"
    );
    uint256 tokenId = _mint(_ipfs, _creator, minter, _receiver);
    if (price > 0) {
      _creator.transfer(price);
    }
    emit Mint(_ipfs, _creator, minter, _receiver, tokenId, price);
  }

  /**
   * @dev I think this is cool function, get IPFS cid from digest hash
   *      it reduces gas cost for NFT minting
   */
  function tokenURI(uint256 tokenId) public view returns (string memory) {
    require(_exists(tokenId), "token must exist");
    return
      string(
        _addIpfsBaseUrlPrefix(
          _bytesToBase58(_addSha256FunctionCodePrefix(ipfsMemory[tokenId]))
        )
      );
  }

  function _getChainId() internal pure returns (uint256) {
    uint256 id;
    assembly {
      id := chainid()
    }
    return id;
  }

  function _addIpfsBaseUrlPrefix(bytes memory input)
    internal
    pure
    returns (bytes memory)
  {
    return abi.encodePacked("ipfs://", input);
  }

  function _addSha256FunctionCodePrefix(bytes32 input)
    internal
    pure
    returns (bytes memory)
  {
    return abi.encodePacked(hex"1220", input);
  }

  function _bytesToBase58(bytes memory input)
    internal
    pure
    returns (bytes memory)
  {
    bytes memory alphabet =
      "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    uint8[] memory digits = new uint8[](46);
    bytes memory output = new bytes(46);
    digits[0] = 0;
    uint8 digitlength = 1;
    for (uint256 i = 0; i < input.length; ++i) {
      uint256 carry = uint8(input[i]);
      for (uint256 j = 0; j < digitlength; ++j) {
        carry += uint256(digits[j]) * 256;
        digits[j] = uint8(carry % 58);
        carry = carry / 58;
      }
      while (carry > 0) {
        digits[digitlength] = uint8(carry % 58);
        digitlength++;
        carry = carry / 58;
      }
    }
    for (uint256 k = 0; k < digitlength; k++) {
      output[k] = alphabet[digits[digitlength - 1 - k]];
    }
    return output;
  }
}
