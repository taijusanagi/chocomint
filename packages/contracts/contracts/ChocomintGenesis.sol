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
  uint256[] public eligibleSeedIds;

  // /**
  //  * @dev Function to get funds received when burned
  //  * @param supply the supply of prints before burning. Ex. if there are 2 existing prints, to get the funds
  //  * receive on burn the supply should be 2
  //  */
  // function getBurnPrice(uint256 supply) public pure returns (uint256 price) {
  //   uint256 printPrice = getPrintPrice(supply);
  //   price = (printPrice * 90) / 100; // 90 % of print price
  // }

  // function getCurrentLowestEligibleBidId() public view returns (uint256) {
  //   uint256 lowestBidId;
  //   uint256 lowestBidPrice;
  //   for (uint256 i = eligibleBidIds.length - 1; i >= 0; i--) {
  //     uint256 tempBidId = eligibleBidIds[i];
  //     uint256 tempCurrentPrice = bidIdToCurrentPrice[tempBidId];
  //     if (i == 0 || lowestBidPrice > tempCurrentPrice) {
  //       lowestBidId = tempBidId;
  //       lowestBidPrice = tempCurrentPrice;
  //     }
  //   }
  //   return lowestBidId;
  // }

  function getLeastEligibleSeedId() public {
    uint256 leastSeedId;
    uint256 leastSeedCount;
    for (uint256 i = 0; i < eligibleSeedIds.length; i++) {
      uint256 tempSeedId = eligibleSeedIds[i];
      uint256 tempSeedCount = seedToVoteCount[tempSeedId];
      if (i == 0 || leastSeedCount > tempSeedCount) {
        leastSeedId = tempBidId;
        leastSeedCount = tempSeedCount;
      }
    }
    return leastSeedId;
  }

  function vote(
    bytes32 _ipfsHash,
    address payable _creatorAddress,
    bytes memory _creatorSignature
  ) public payable {
    // verification
    bytes32 seed =
      keccak256(abi.encodePacked(_getChainId(), address(this), _ipfsHash, _creatorAddress));
    uint256 voteCount = seedCount[seed];
    if (voteCount == 0) {
      require(
        seed.toEthSignedMessageHash().recover(_creatorSignature) == _creatorAddress,
        "ChocomintGenesis: creator signature must be valid for seed"
      );
      // TODO: msg.value verification
      if (eligibleSeedIds.length < MAX_PRINT_SUPPLY) {
        uint256 votePrice = getPrintPrice(1);
        require(msg.value > votePrice, "ChocomintGenesis: value must be more than vote price");
        eligibleSeedIds.push(seed);
        seedCount[seed]++;
      } else {
        // TODO: replace seed from last
        uint256 leastEligibleSeedId = getLeastEligibleSeedId();
        uint256 leastEligibleSeedCount = seedToVoteCount[leastEligibleSeedId];
        uint256 votePrice = getPrintPrice(leastEligibleSeedCount + 1);
        require(msg.value > votePrice, "ChocomintGenesis: value must be more than vote price");
        address minterAddress = seedToMinterAddress[leastEligibleSeedId];
        delete seedToVoteCount[leastEligibleSeedId];
        delete seedToIpfsHash[leastEligibleSeedId];
        delete seedToCreatorAddress[leastEligibleSeedId];
        delete seedToCreatorAddress[leastEligibleSeedId];

        seedToMinterAddress[seed] = msg.sender;
        minterAddress.transfer(msg.value);
      }
      seedToIpfsHash[bidId] = _ipfsHash;
      seedToCreatorAddress[bidId] = _creatorAddress;
    } else {
      uint256 lastEligibleSeedCount = seedToVoteCount[seed];
      uint256 votePrice = getPrintPrice(lastEligibleSeedCount + 1);
      require(msg.value > votePrice, "ChocomintGenesis: value must be more than vote price");
      seedCount[seed]++;
      address minterAddress = seedToMinterAddress[seed];
      seedToMinterAddress[seed] = msg.sender;
      minterAddress.transfer(msg.value);
    }
  }

  // using SafeMath for uint256;
  // using ECDSA for bytes32;
  // event Finalized(uint256 blockNumber, uint256 blockTimestamp, uint256 sender);
  // uint256 public bidIdCount;
  // uint256 public lastBidId;
  // mapping(uint256 => uint256) public tokenIdToBidId;
  // mapping(uint256 => uint256) public bidIdToTokenId;
  // mapping(uint256 => uint256) public previousBidId;
  // // mapping(uint256 => uint256) public bidIdToEligibleBidIdsIndex;
  // mapping(uint256 => uint256) public bidIdToCurrentPrice;
  // mapping(uint256 => address payable) public bidIdToCurrentBidderAddress;
  // mapping(uint256 => address payable) public bidIdToCreatorAddress;
  // mapping(uint256 => bytes32) public bidIdToIpfsHash;
  // uint256[] eligibleBidIds;
  // function updateEligibleBidIds(uint256 _bidId, uint256 _bidPrice) public {
  //   if (eligibleBidIds.length == 0) {
  //     eligibleBidIds.push(_bidId);
  //   } else {
  //     uint256 previousBidIndex;
  //     uint256 newBidIndex;
  //     uint256 lastBidPriceForBidId = bidIdToCurrentPrice[_bidId];
  //     uint256 leastEligibleBidId = bidIdToCurrentPrice[eligibleBidIds.length - 1];
  //     require(lastBidPriceForBidId < _bidPrice);
  //     require(leastEligibleBidId < _bidPrice);
  //     for (uint256 i = eligibleBidIds.length - 1; i >= 0 && newBidIndex == 0; i--) {
  //       uint256 tempBidId = eligibleBidIds[i];
  //       if (tempBidId == _bidId) {
  //         previousBidIndex = i;
  //       }
  //       if (bidIdToCurrentPrice[tempBidId] < _bidPrice) {
  //         newBidIndex = i;
  //       }
  //       for (uint256 j = newBidIndex.add(1); j < eligibleBidIds.length; j++) {
  //         if (j == eligibleBidIds.length.sub(2)) {
  //           if (eligibleBidIds.length < 100) {
  //             eligibleBidIds.push(eligibleBidIds[j]);
  //           }
  //         } else {
  //           eligibleBidIds[j.add(1)] = eligibleBidIds[j];
  //         }
  //       }
  //       eligibleBidIds[newBidIndex] = _bidId;
  //     }
  //   }
  //   // for(uint256 i =0; i < ){
  //   // }
  // }
  // string public constant name = "ChocomintGenesis";
  // string public constant symbol = "CMG";
  // uint256 public constant supplyLimit = 256;
  // uint256 public constant ownerCutRatio = 100;
  // uint256 public constant ratioBase = 10000;
  // uint256 public constant selectiveSeasonPeriod = 7 days;
  // uint256 public constant timeLimitAfterSelectiveSeasonPeriod = 10 minutes;
  // uint256 public totalSupply;
  // uint256 public lastBiddedAt;
  // uint256 public limitExceededAt;
  // uint256[] public eligibleBidIds;
  // uint256 public blockNumberAtClosed;
  // uint256 public blockNumberAtFinalized;
  // function bid(
  //   bytes32 _ipfsHash,
  //   address payable _creatorAddress,
  //   bytes memory _creatorSignature
  // ) public payable {
  //   require(isOpenToBid(), "ChocomintGenesis: bid is already closed");
  //   bytes32 hash =
  //     keccak256(abi.encodePacked(_getChainId(), address(this), _ipfsHash, _creatorAddress));
  //   uint256 bidId = uint256(hash);
  //   bool isRefundRequired;
  //   address payable refundRecipient;
  //   uint256 refundPrice;
  //   if (bidIdToCurrentPrice[bidId] == 0) {
  //     require(
  //       hash.toEthSignedMessageHash().recover(_creatorSignature) == _creatorAddress,
  //       "ChocomintGenesis: creator signature must be valid"
  //     );
  //     bidIdToIpfsHash[bidId] = _ipfsHash;
  //     bidIdToCreatorAddress[bidId] = _creatorAddress;
  //     if (eligibleBidIds.length < supplyLimit) {
  //       bidIdToEligibleBidIdsIndex[bidId] = eligibleBidIds.length;
  //       eligibleBidIds.push(bidId);
  //       if (eligibleBidIds.length == supplyLimit) {
  //         limitExceededAt = now;
  //       }
  //     } else {
  //       uint256 lowestBidId = getCurrentLowestEligibleBidId();
  //       require(
  //         msg.value > bidIdToCurrentPrice[lowestBidId],
  //         "ChocomintGenesis: value must be more than lowest bid price"
  //       );
  //       isRefundRequired = true;
  //       refundPrice = bidIdToCurrentPrice[lowestBidId];
  //       refundRecipient = bidIdToCurrentBidderAddress[lowestBidId];
  //       eligibleBidIds[lowestBidIndex] = bidId;
  //       delete bidIdToCurrentPrice[lowestBidId];
  //       delete bidIdToCurrentBidderAddress[lowestBidId];
  //       delete bidIdToCreatorAddress[lowestBidId];
  //       delete bidIdToIpfsHash[lowestBidId];
  //     }
  //   } else {
  //     require(
  //       msg.value > bidIdToCurrentPrice[bidId],
  //       "ChocomintGenesis: value must be more than last bid price"
  //     );
  //   }
  //   bidIdToCurrentPrice[bidId] = msg.value;
  //   bidIdToCurrentBidderAddress[bidId] = msg.sender;
  //   lastBiddedAt = now;
  //   if (isRefundRequired) {
  //     refundRecipient.transfer(refundPrice);
  //   }
  // }
  // /**
  //  * @dev This transaction is only allowed by creator or bidder because this transcation has special meaning for both
  //  * This keeps block number of finalization transaction
  //  * This transaction is trigger of NFT distribution,
  //  * so to avoid dependency on owner, anyone can make transaction when bid is closed
  //  */
  // function mint(uint256 bidId) public {
  //   require(!isOpenToBid(), "ChocomintGenesis: bid is still open");
  //   require(bidIdToTokenId[bidId] == 0, "ChocomintGenesis: NFT is already claimed");
  //   require(bidIdToCurrentPrice[bidId] > 0, "ChocomintGenesis: bid is not eligible");
  //   address payable creatorAddress = bidIdToCreatorAddress[bidId];
  //   address payable bidderAddress = bidIdToCurrentBidderAddress[bidId];
  //   address ownerAddress = owner();
  //   totalSupply = totalSupply.add(1);
  //   uint256 tokenId = getBidRanking(bidId);
  //   _mint(bidderAddress, tokenId);
  //   uint256 price = bidIdToCurrentPrice[bidId];
  //   uint256 ownerCut = getOwnerCut(price);
  //   uint256 creatorReward = price.sub(ownerCut);
  //   tokenIdToBidId[tokenId] = bidId;
  //   bidIdToTokenId[bidId] = tokenId;
  //   creatorAddress.transfer(creatorReward);
  //   if (totalSupply == supplyLimit) {
  //     blockNumberAtFinalized = block.number;
  //   }
  // }
  // /**
  //  * @dev Get sha256 of concatenated all NFT ipfs hash as provenance
  //  * Ipfs hash is sorted by token id (1 -> 256), this is finalized after all bid is closed and owner confirmation
  //  * This is inspired by CryptoPunks and Hashmasks, and Chocomint provides provenence by onchain calculation
  //  * I hope this will be part of NFT digital art standard in the future
  //  */
  // function getProvenance() public view returns (bytes32) {
  //   require(blockNumberAtFinalized > 0, "ChocomintGenesis: contract is still not finalized");
  //   bytes memory rawProvenance;
  //   for (uint256 i = 1; i <= totalSupply; i++) {
  //     uint256 bidId = tokenIdToBidId[i];
  //     rawProvenance = abi.encodePacked(rawProvenance, bidIdToIpfsHash[bidId]);
  //   }
  //   return sha256(rawProvenance);
  // }
  // /**
  //  * @dev We take 10% fee from creator reward for future development
  //  * This can be executed after all NFT is claimed
  //  * This is final owner transaction, so owner role is renounced as well
  //  */
  // function withdraw() public onlyOwner {
  //   require(blockNumberAtFinalized > 0, "ChocomintGenesis: contract is still not finalized");
  //   renounceOwnership();
  //   msg.sender.transfer(address(this).balance);
  // }
  // function getOwnerCut(uint256 _price) public returns (uint256) {
  //   return _price.mul(ownerCutRatio).div(ratioBase);
  // }
  // function isOpenToBid() public view returns (bool) {
  //   if (finalized) {
  //     return false;
  //   } else {
  //     if (eligibleBidIds.length < supplyLimit) {
  //       return true;
  //     } else {
  //       if (limitExceededAt.add(selectiveSeasonPeriod) < now) {
  //         true;
  //       } else {
  //         return lastBiddedAt + timeLimitAfterSelectiveSeasonPeriod > now;
  //       }
  //     }
  //   }
  // }
  // function pushBidIdToEligibleBidIds(uint256 bidId, uint256 bidPrice) public {
  //   for (uint256 i = 0; i < eligibleBidIds.length; i++) {
  //     uint256 tempBidId = eligibleBidIds[i];
  //     uint256 tempPrice = bidIdToCurrentPrice[tempBidId];
  //     uint256 bidIndex;
  //     uint256 countSamePriceAndBeforeTargetIndex;
  //     uint256 countOverPrice;
  //     if (bidPrice < tempPrice) {
  //       countOverPrice = countOverPrice.add(1);
  //     } else if (bidPrice == tempPrice) {
  //       if (bidIndex < i) {
  //         countSamePriceAndBeforeTargetIndex = countSamePriceAndBeforeTargetIndex.add(1);
  //       }
  //     }
  //   }
  // }
  // function getBidRanking(uint256 bidId) public view returns (uint256) {
  //   uint256 bidPrice = bidIdToCurrentPrice[bidId];
  //   uint256 bidIndex = bidIdToEligibleBidIdsIndex[tokenId];
  //   for (uint256 i = 0; i < eligibleBidIds.length; i++) {
  //     uint256 tempBidId = eligibleBidIds[i];
  //     uint256 tempPrice = bidIdToCurrentPrice[tempBidId];
  //     uint256 bidIndex;
  //     uint256 countSamePriceAndBeforeTargetIndex;
  //     uint256 countOverPrice;
  //     if (bidPrice < tempPrice) {
  //       countOverPrice = countOverPrice.add(1);
  //     } else if (bidPrice == tempPrice) {
  //       if (bidIndex < i) {
  //         countSamePriceAndBeforeTargetIndex = countSamePriceAndBeforeTargetIndex.add(1);
  //       }
  //     }
  //   }
  //   return countOverPrice.add(countSamePriceAndBeforeTargetIndex).add(1);
  // }
  // function getCurrentLowestEligibleBidId() public view returns (uint256) {
  //   uint256 lowestBidId;
  //   uint256 lowestBidPrice;
  //   for (uint256 i = eligibleBidIds.length - 1; i >= 0; i--) {
  //     uint256 tempBidId = eligibleBidIds[i];
  //     uint256 tempCurrentPrice = bidIdToCurrentPrice[tempBidId];
  //     if (i == 0 || lowestBidPrice > tempCurrentPrice) {
  //       lowestBidId = tempBidId;
  //       lowestBidPrice = tempCurrentPrice;
  //     }
  //   }
  //   return lowestBidId;
  // }
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
