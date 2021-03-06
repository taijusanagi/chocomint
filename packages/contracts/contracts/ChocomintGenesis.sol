// SPDX-License-Identifier: MIT
pragma solidity ^0.5.17;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "hardhat/console.sol";

// Contract is created by Taiju Sanagi (taijusanagi.eth)
// Chocomint is named by Kenta Suhara (suhara.eth)
// ASCII art is created by Daiki Kunii (daiki.kunii.eth)
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
// For all NFT lovers.

// contract ChocomintGenesis is Ownable, ERC721 {
contract ChocomintGenesis is EulerBeatsPriceCurve {
  mapping(bytes32 => uint256) public seedToVoteCount;
  mapping(bytes32 => bytes32) public seedToIpfsHash;
  mapping(bytes32 => bytes32) public seedToCreatorAddress;
  mapping(bytes32 => bytes32) public seedToMinterAddress;

  //
  uint256[] public eligibleSeeds;

  /**
   * @dev Function to get update target seed
   */
  function getUpdateTargetSeed(bytes32 seed) public view returns (bytes32) {
    uint256 voteCount = seedToVoteCount[seed];
    if (voteCount == 0 && eligibleSeeds.length >= MAX_PRINT_SUPPLY) {
      uint256 updateTargetSeedCount;
      for (uint256 i = 0; i < eligibleSeeds.length; i++) {
        uint256 tempSeed = eligibleSeeds[i];
        uint256 tempSeedCount = seedToVoteCount[tempSeed];
        if (i == 0 || leastSeedCount > tempSeedCount) {
          leastSeedId = tempBidId;
          leastSeedCount = tempSeedCount;
        }
      }
      return updateTargetSeedCount;
    } else {
      return seed;
    }
  }

  function registerSeed(
    bytes32 _ipfsHash,
    address payable _creatorAddress,
    bytes memory _creatorSignature
  ) internal {
    require(
      seed.toEthSignedMessageHash().recover(_creatorSignature) == _creatorAddress,
      "ChocomintGenesis: creator signature must be valid for seed"
    );
    seedToIpfsHash[bidId] = _ipfsHash;
    seedToCreatorAddress[bidId] = _creatorAddress;
  }

  function isSeedRegistered(bytes32 seed) public view returns (bool) {
    return seedToIpfsHash[seed] != "" && seedToCreatorAddress = !address(0x0);
  }

  function vote(
    bytes32 _ipfsHash,
    address payable _creatorAddress,
    bytes memory _creatorSignature
  ) public payable {
    bytes32 seed =
      keccak256(abi.encodePacked(_getChainId(), address(this), _ipfsHash, _creatorAddress));
    if (!isSeedRegistered()) {
      registerSeed(_ipfsHash, _creatorAddress, _creatorSignature);
    }
    vote(seed);
  }

  function vote(bytes32 seed) public payable {
    require(isSeedRegistered(), "ChocomintGenesis: seed must be registered");
    bytes32 updateTargetSeed = getUpdateTargetSeed(seed);
    uint256 seedVoteCount = seedToVoteCount[seed];
    uint256 nextVoteCount = seedToVoteCount[updateTargetSeed] + 1;
    uint256 votePrice = getPrintPrice(nextVoteCount);
    require(msg.value > votePrice, "ChocomintGenesis: value must be more than vote price");
    if (seedVoteCount == 0) {
      if (eligibleSeeds.length < MAX_PRINT_SUPPLY) {
        seedToEligibleSeedsIndex[seed] = eligibleSeeds.length;
        eligibleSeeds.push(seed); // insert to last
      } else {
        uint256 updateTargetIndex = seedToEligibleSeedsIndex[updateTargetSeed];
        seedToVoteCount[seed] = nextVoteCount;
        eligibleSeeds[updateTargetIndex] = seed; // insert to last
        delete seedToVoteCount[updateTargetSeed];
      }
    }
    seedToMinterAddress[seed] = msg.sender;
  }

  // ranking -> tokenId
  function mint(bytes32 seed) public {
    address payable creatorAddress = seedToCreatorAddress[seed];
    address payable bidderAddress = seedToMinterAddress[seed];
    totalSupply = totalSupply++;
    uint256 tokenId = totalSupply;

    _mint(bidderAddress, tokenId);
    uint256 price = bidIdToCurrentPrice[bidId];
    uint256 ownerCut = getOwnerCut(price);
    uint256 creatorReward = price.sub(ownerCut);
    tokenIdToBidId[tokenId] = bidId;
    creatorAddress.transfer(creatorReward);
  }

  // function tokenURI(uint256 tokenId) public view returns (string memory) {
  //   require(_exists(tokenId), "token must exist");
  //   uint256 bidId = tokenIdToBidId[tokenId];
  //   return
  //     string(
  //       _addIpfsBaseUrlPrefix(_bytesToBase58(_addSha256FunctionCodePrefix(bidIdToIpfsHash[bidId])))
  //     );
  // }
  // function _getChainId() internal pure returns (uint256) {
  //   uint256 id;
  //   assembly {
  //     id := chainid()
  //   }
  //   return id;
  // }
  // function _addIpfsBaseUrlPrefix(bytes memory input) internal pure returns (bytes memory) {
  //   return abi.encodePacked("ipfs://", input);
  // }
  // function _addSha256FunctionCodePrefix(bytes32 input) internal pure returns (bytes memory) {
  //   return abi.encodePacked(hex"1220", input);
  // }
  // function _bytesToBase58(bytes memory input) internal pure returns (bytes memory) {
  //   bytes memory alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  //   uint8[] memory digits = new uint8[](46);
  //   bytes memory output = new bytes(46);
  //   digits[0] = 0;
  //   uint8 digitlength = 1;
  //   for (uint256 i = 0; i < input.length; ++i) {
  //     uint256 carry = uint8(input[i]);
  //     for (uint256 j = 0; j < digitlength; ++j) {
  //       carry += uint256(digits[j]) * 256;
  //       digits[j] = uint8(carry % 58);
  //       carry = carry / 58;
  //     }
  //     while (carry > 0) {
  //       digits[digitlength] = uint8(carry % 58);
  //       digitlength++;
  //       carry = carry / 58;
  //     }
  //   }
  //   for (uint256 k = 0; k < digitlength; k++) {
  //     output[k] = alphabet[digits[digitlength - 1 - k]];
  //   }
  //   return output;
  // }
}
