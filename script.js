(function(){

const TEMPLATE_B64_CIM = "UEsDBBQACAgIAE039lwAAAAAAAAAAAAAAAAQAAAAd29yZC9oZWFkZXIxLnhtbKVW4W7bIBB+gr1D5P+tnSyNuqhplaXqNKmaqm57gAvgmAUDAhy3ffqBDSSxu8rJ8iOGu/u+u+OOs2/uXko22hGlqeCLZHyZJSPCkcCUbxbJ718PF9fJSBvgGJjgZJG8Ep3c3X66qecFViML5npeokVSGCPnaapRQUrQl0ISbpW5UCUYu1WbtAS1reQFEqUEQ9eUUfOaTrJslngasUgqxeee4qKkSAktcuMgc5HnFBH/CAg1xG8LuReoKgk3jcdUEWZjEFwXVOrAVp7LZpVFINl9lMSuZMGulkO8YQW1rUTJWke1UFgqgYjWVnrfKiPjOBtwgI4iIoaEcOwzRFIC5ZHG9UWHKPq+tL79oTVU+0T2Z6HZkEBa1SNdK1Cv/SjgjPM8xEs6qIs7DBZlKhUb8hwKVIAygYCdw8AE2hK8Ar6D2Mx4M6idO0yYwkZBuW9SfVJlx1mnXX4WIMmebfN/bN+UqOS+3afnsB3cwPHVaQSTHsHsNILrPgEiL+dxpBZ5yEPxaTyzyEPDPBhGYEBvtWP4kmI/BRtRvAL9ofwuj106rKOaZHYgA2oGcnJrXy1yVM/tGwk/L5LM/xIvuiesL3zqi57vSQ4VM+9ontSRcDydS1DwHXvpeHzVBvGk3GNLiPxBXoxF78D5TtIgfqSc6I68pljUK8GNEiyoxq1KfsUNoxEuPy0BEQdz6ze/aMw5ZS2AkdwMs1wLY0Q5zFbRTTGUlpiaED7EON3npwtslTllVguVEdEUMQKqZTaw1v4ZtbYbiHLG1gwTWyRuvzjcXgrbm9PZdRaxAdPk8k/Il8+zzMcW/Lk87CSxFpAbB2gSWRM7E0N6jLr32WQaN88VIz6Txj/leNQWxyOaKPw6p0qbx4bCh/sHhWgdxNeg7S31YBvFdRBoROkiWSoKzLEgfbAhoM1SUzgQFUuuo31bqk4frlfdzqTdfc9Cl8DYCmRPbhTdko4QCSZUlLWXqbV+C9LJJEj2roKsiv3jKpYO7Rv7pWqWjG540K1BE1ckX+fmYNN4edVHU+Od6XI8Gw4rZdhR/geuvMPm334T3/4FUEsHCH4A+NAdAwAAUwsAAFBLAwQUAAgICABNN/ZcAAAAAAAAAAAAAAAAEgAAAHdvcmQvbnVtYmVyaW5nLnhtbO1c3W7iOBR+gn0HFInLNj+EkEFDR1VHHc1oVY3U2QcwiQGriR3ZCbTzCnuxd7u3cz2PtU+yTkgChELtrBmC5KuUY59jf19P/J1jJN5/eI6j3hJShgieGPa1ZfQgDkiI8Hxi/PHt/so3eiwFOAQRwXBivEBmfLj57f1qjLN4Cimf1+MhMBvHwcRYpGkyNk0WLGAM2DVJIOaDM0JjkPKPdG7GgD5lyVVA4gSkaIoilL6YjmV5RhmGTIyM4nEZ4ipGASWMzNLcZUxmMxTA8lF5UJF11y4fSZDFEKfFiiaFEd8DwWyBElZFi9tG44OLKsjyGIhlHFXzVonIaiEFK85zHK0XWhEaJpQEkDFu/bgerCPalgCBeYjaQ2QLu2tWO4kBwnWYPDsageq1r/naJWlFqA2QDRcsEtnIeuh3NKWAvuzvArTgc9s/QUJZ3IjAvdKM1gnZJkSwADStAkRtIkQkeILhHcBLUCdzOBdK50akEIE5BfEmSZnUf9a2GunyuAAJ3ESb/79onyjJkk26u22ibb2B9lAugLMXwJML4O8HCOBzuxgm99yOg0K5OF4dB1XngViAFLAnlkd4Z4blKViY6ldg/1B+NQ7/M/fNQzkWP5BBUBzIxg0XGDBlKeWGhyzu7Xz6zFHaxZRoGfEhxB8TwyosXKtoym1LEOWTzJu1Ut3HtXGaRRFM1yPc8Rt8rof+/eev2v4lqKwRnJXTk680fyAc8rHcPDFGDlfM1XgB8LyQzIFn5XPNejItH/eEw8xxsAChiXFLEYhyz4BtfYCApbcMgS3T4hazen6xi6zaGOaKXC5WrGIWG2/yYqvg5U9ZXmzXFSNGEo2jAM3fP2TROLZ3EjSDs+Ss4/snQeOeJdP45k+CZniWTHMHggeKJBrvLJk2tE5zCozOkmnD0WlOAf8smea5qk4Bc0ed35RuR0u3lm4t3Vq6tXRr6dbSfUnSPdDSraVbS7eWbi3dWrq1dF+SdLtaurV0a+nW0q2lW0u3lu5Lku7hhUv3A0lJ7xFg1nt8iackYpWMvzqwkfRXh0t53x/7FbpOTqbqTc7uSEYRpL0HuKrYapg2PDUGSoa2rb+mSvh5siqhoxnV8Wqko6wpqHqk30PhmufM76GSGkr6PRSuoTqaUR2v1TrKmoKaUPo9FK4Iz/weKqkwpd9D4QqzMxklWcl6rSvZEAYori50Gkz37esWeiBE9LSxqekd27GoqTjfANd3OopPtGp8G19/IA2x2Y3kn9VDFC3xhCD23Y6iFC3JRFH2h9JAbatx9hUG9VBFKywJqH2vs2hFKyM5tP2RPOBmI1wY1AMWLWqkAff9zmIWLVbaYO6/k4ftN3qtwqACtmS1MdL3ZmJVHafke4VkrS+5ZfPPqDVH364d6CZUMKjv4E6XnSpu6lpw2/mbOhXcqvgWU57b1jd6F8Wtvg88Hbcqbg3lue3+raEKblV839yC27a3ixfFrb6bVMmtZE/h655C9xS6p9A9he4pdE9xmdzqnkL3FJfIre4pdE9xGdzu9xS46CXw9m9X7TQWO6Sbxcw9N+ewm3PEbXDYbXDEzT3s5h5xGx52Gx5x8w67eUfcRofdRkfc/MNu/rabufUrlzf/AVBLBwippTabuQQAACtTAABQSwMEFAAICAgATTf2XAAAAAAAAAAAAAAAABEAAAB3b3JkL3NldHRpbmdzLnhtbKWW23LaMBCGn6DvwOgefEigKRPITJtJe9FcQR5gkYStQaeRZAhvX8m2bA6djqFXSP/ufiuv1yueXz4FH+2psUzJBcomKRpRiRVhsligj/Xb+AmNrANJgCtJF+hILXpZfnk+zC11znvZkSdIOxd4gUrn9DxJLC6pADtRmkpv3CojwPmtKRIBZlfpMVZCg2Mbxpk7JnmazlCLUQtUGTlvEWPBsFFWbV0ImavtlmHa/sQIMyRvE/KqcCWodHXGxFDuz6CkLZm2kSbupXljGSH7fz3EXvDod9BDshEDB19owZtEB2WINgpTa7362hg7YpYOKGBAdBFDjnCeM55EAJMdJjTHBajLPfG526LVqP5B+lpYPuQgjek32xgwx+tTwB31PI3XbFAXXxB8lKtM15D3IHAJxkUAv4fAFd5R8gPkHrpmJsWgdr4gEQaFAdE3qb3pzWbpRbusStC0pxX/R/tpVKX7dn+8h3byBWbT2wD5FWB2G+DpGoDp532MxEeechi5jTPrOCzOg2EAB3ZnA+FbQtopWEvdJ3A9lP/K8csQG1B56gcy4Hogo6W/XwizmsPxO+Bd4d+5JHUfjQ7zPfhRkaEkOFGxoWRtKro+avqmPOrCgdAtVNytYbNySkfj1zxtzM1F1K9WzaXWQabILyUIP9zO7qx3RWgwVYYNL3lImZzl5GYVgug7aN2k3RTZAnFWlC4LfOd3xN+Z9WZT5K0tr215Y6s3gLEvpPduF72WR+3E7yFqD732GLXHXptGbdprs6jNglb6uhvO5M6XIS6DvlWcqwMlv3r7ldTWI/6RWP4BUEsHCDeErNRgAgAAjQgAAFBLAwQUAAgICABNN/ZcAAAAAAAAAAAAAAAAEgAAAHdvcmQvZm9udFRhYmxlLnhtbKWV247bIBCGn6DvYHGf2InaaGuts9qDWlWt9mKz+wATIDYKMBbgeKOq714cH5ImVuV4ubAxw//NAMP49u5dyWDHjRWoEzKbRiTgmiITOk3I2+u3yQ0JrAPNQKLmCdlzS+6Wn27LeIPa2cDLtY0VTUjmXB6HoaUZV2CnmHPtjRs0Cpz/NGmowGyLfEJR5eDEWkjh9uE8ihakwWBCCqPjBjFRghq0uHGVJMbNRlDevFqFGeK3ljwhLRTX7uAxNFz6GFDbTOS2pamxNG/MWsjuf4vYKdnOK/Mh3piB0p+FkrWjEg3LDVJurR99qo0dcRYN2MAK0SmGhPCvzzYSBUJ3mCozzkCd76n33WzaAXVcyHEvrBwSSG36JdYGzP4yChixn6f6XAzK4jOCV7nCdAk5BkEzMK4FyDEEiXTL2SPoHXTJzNJB6XxGYgJSA+qYpPaqk51FZ+myyiDnR1r6Mdp3g0V+TPfPY2gnN3D25TrA/AKwuA5wcwmg/H0cI/TKU45g13EWHUe09WAYwIHd2orwNWRNFTwMdVfgsij3cny30laoeeQLMtBDQSbL5ucSlLEG5SvLvREgSXgx/ioUt8EzL4MXVKB7ZjyC9NVC9FmwMIKbSt1jfUaHwQq0DVZ7tUZZB8XVmrMXnhYSTFArfvJ9Qn5HTZv0PNr2hwQmrs7I/GAz4uW2WFvuHPdDUR3Cgf+Akn0IPu+DhzWx69jlX1BLBwiLfkUbHAIAAPoHAABQSwMEFAAICAgATTf2XAAAAAAAAAAAAAAAAB0AAAB3b3JkL19yZWxzL2ZvbnRUYWJsZS54bWwucmVsc72QsWoDMQyGn6DvYLTnfMlQSokvSylkyZCkD+Da8t0R2zKWUnpvX3coNJChUxfBj9Cnj3+7+0xRfWDlmbKBddeDwuzIz3k08HZ+XT2BYrHZ20gZDSzIsBsetkeMVtoNT3Nh1SCZDUwi5VlrdhMmyx0VzG0TqCYrLdZRF+sudkS96ftHXX8zYLhhqr03UPd+Deq8FPwLm0KYHb6QuybMcueFDpSl8WwdUQx8J9YHEjrZzKclvVPkVcXxGm3tRALo+06b/3Zqw/8I6Zvmhy9QSwcIVLPNfc0AAADBAQAAUEsDBBQACAgIAE039lwAAAAAAAAAAAAAAAAPAAAAd29yZC9zdHlsZXMueG1s7ZbrbtowFMefYO+A8r1NCBcxVFp1VN0mdReV7gEOiSEWjm3ZDpQ+/ezcCEmgIVRqJ639QHzs87f98/Hxubp5DklnjYTEjE6s7qVjdRD1mI/pcmL9ebq/GFkdqYD6QBhFE2uLpHVz/elqM5ZqS5DsaH8qx6E3sQKl+Ni2pRegEOQl44jqzgUTISjdFEs7BLGK+IXHQg4KzzHBamu7jjO0Uhk2sSJBx6nERYg9wSRbKOMyZosF9lD6k3mIJvMmLnfMi0JEVTyjLRDRa2BUBpjLTC1sq6Y7g0xkfWwT65Bk4za8yWy+gI0+jJAkE22Y8LlgHpJSW++Szlyx6zQAaCRyjyZL2J8zW0kImOYyJjRKQvncl3ruFFostdvIjoUkTRaSdD3guQCxra4CWvAs+nPcKIpLCtpLRSIPyDYSXgBCZQKkjQJh3gr5U6BryIPZXzYK55KSj2EpINwFqTzpZLtOKVxmAXC0U1uep/ZVsIjvwr3fRq1wA7uD0wTcisDwNIFRVcBDz+00bO1Z1MH+aTrDXAdn+aCZgAK5kkbhs+2nWTA25VegmpRrdfSn8TVSrqMTMnhxQrau9euihe/QAiKipGmK3yJtpq34555p785mDNLDeGLdCgya7GbsyUIDgVS3EkPBFNxSmY+3jZR80eY16CzkupllKss2AnSZ2QQzNjtdjF1eIi+3ksFFs13ZZfyk6gnUlut8qmBOkFlubP6uT/fJWH6auxtvw09c9bMdI6MQomx1xZHx0tWcJND0xxQR8gOSFuPaRb8CXccxb382t/8M6ZbRQh0fMWdKsfD4GIGXwVEZe39hdr5gO91+FQ8HYTIVD/YQNaJDczCnyn9DYEqjqmSQdHS6KRSQyP9Fs97iSVD0rOrsPDmfFUL8Z2FIKmjMD5giWbJLDh6OoxIWCumL13VjunOkc7zeRt+Jm0S7PkZEGyBSWeSmM6a3aXcF+k71CiS2Qri3weYexOZ+MGy94enYejWZI7Gdia13EFvvvbGN9qm5Tal5jDCRx1bP/FcS8agmEY/eAGf/IM7+x8LpjlrhHMZ/FZz9Gpz9N8A5OIhz8MFw9s/EeSao4UFQw38VFC4J42l5qjdG+YSVrokq1U5sfWeGLV6MQc2LMTjrxZhFc1WLKO94Z0otn4j6nNarKVR6DQuVA9V1UtmV+BytpmfG/5FtvgD1Z/gFlQhkI6aMHB5RV5G/Wo93B6/W469X47UiLarxAzjd/zgb4cy+5PVfUEsHCDR7JoKlAwAAkhUAAFBLAwQUAAgICABNN/ZcAAAAAAAAAAAAAAAAGAAAAGN1c3RvbVhNTC9pdGVtUHJvcHMxLnhtbJ2QwWrDMAyGn2DvYHRvnHRjjFKnlzLotWywq3GUxGBbwVLGyti7z6HrYTnsMIEEktCnX9ofPmJQ75jZUzLQVDUoTI46nwYDry/PmydQLDZ1NlBCAxdkOLR3+453nRXLQhlPglEVTio1NjCKTDut2Y0YLVc0YSrNnnK0UtI8aOp77/BIbo6YRG/r+lG7ubDiWwygCtsX5Olo4LP5sU2zvX9YhZt/QbvouS48Y8+/04U3Z/9fYRmDlfIdHv3EoP9mX68gKtzbmoFoCFg5inqZ1iulev3J9htQSwcIDONlgNYAAACUAQAAUEsDBBQACAgIAE039lwAAAAAAAAAAAAAAAATAAAAY3VzdG9tWE1ML2l0ZW0xLnhtbJWS35KaMBTGn6Dv4OS+gkR3dxxxRxRx7YLKIq7chSRGkCQUQkWeviz2z3Q6vehlcr7fOd93kslzzbPeN1qUiRQmGPR10KMCS5IIZoJ9sPz8BHqlQoKgTApqghstwfP004TJMVtIXM6rUkn+zrMFUuhNyQIx2mt7inLMpAnOSuVjTcOdSsq2UOIz5ajsMylZRvtYcg38AIpf+p8imVPR1k6y4Ei1x4Jp8nRKMG1HV5wKpRm6/qAVNEOqDVCek7wEvapITOB0/X9b/PAX3nMaYPrhn/xR+3/ThawEUUWSd9ETJpCqinZFM1fVjzzV34zTQ4S3+8f3L3Yabk/zyOeZawdqZ5pgOmdu/ZrObgvOKiII3zjK8A6j62YRSpeN5KuIzvGBDT1hGyTwDRS8bNB8WEeBdYkb70pXUeMZl47HgZWRlcVjx1d4YcGOT3c14jl3DU94KW5wx49ux+YyQNDK0CG/4cDu+GMajlC6hig91qiJ7vNT/4rhWbiOukTQbuI7z12xHHo8/xo7JCFQ3v0faiPiTw02MhHDHdzMrNtLYBvhMuK7vafvwj2kju8jvb4QMYPe0oLxYL2Nl9l6v7JWm5lpTrS/nmTa3f3zm02/A1BLBwgxf6Q2zgEAAL0CAABQSwMEFAAICAgATTf2XAAAAAAAAAAAAAAAAB4AAABjdXN0b21YTUwvX3JlbHMvaXRlbTEueG1sLnJlbHONz8GKwjAQBuAn8B3C3G1aDyJLUy+L4E2kwl5DOm3DNpmQGUXf3uBphT14nBn+72fa/T0s6oaZPUUDTVWDwuho8HEycOkP6x0oFhsHu1BEAw9k2Her9oyLlZLh2SdWBYlsYBZJX1qzmzFYrihhLJeRcrBSxjzpZN2vnVBv6nqr818DujdTHQcD+Tg0oPpHwk9sGkfv8JvcNWCUfyq0u7JQ+AnLKVNpVL3NE4oBLxheq6YqJuiu1W//dU9QSwcIa1o00LoAAAAnAQAAUEsDBBQACAgIAE039lwAAAAAAAAAAAAAAAARAAAAd29yZC9kb2N1bWVudC54bWztfVtv20qa4C/Y/1Ab9AAOoOjmW6KedK8tK6c14ziB7JzeBgYISmRJroQssotF2fHBWSzG773A7stkzsMOzrz3y77s88YD+HfMH9j9Cft9VSQl+ZI4jhUVqTrojimyWCTrq+9++9vfn4YBmTCZ8Eg8f9SqNx8RJrzI52L8/NGboxdPnj4iiaLCp0Ek2PNHH1jy6Pe/+w9/e9LxIy8NmVAEZhBJJ/SePzpWKu40Gol3zEKa1KOYCbg4imRIFfyU40ZI5fs0fuJFYUwVH/KAqw+NdrO59SibJnr+KJWik03xJOSejJJopPCWTjQacY9lf/I75F2ea27Zy15ZP7EhWQDvEInkmMdJPlt439ng4nE+yeRzHzEJg3zcSXyXp/mSngA4wsA86CSSfiwjjyUJnN0zF4sZW807LCBOUdxxl1eYf2b+JiHlopgGN8eViYpn1+HZ2aLpqaYfMl2LJLjLi5hL+3woqfxw/S3oPdZz9v6Y32kXX5kB7lKpLDbkfabwjqlU+QTBfWYIIu8987tUTGixmf3xnbbzlZl8TseShtNNmnwVZFvNK9vl8JjGbDrb+Ntm+0FGaTzd7hv3mW0GA1ubXzdB+9oEW183wdPrE3js9H5zNODO2Xm4/3XzbBXz8Jwe3G0CRZP3Cc7wrJGzAX2qQIHrRPnGeeAQ78Wp2k0gyNTTBPnR74C/DKn3fgzAFj456XhREMGcL/R/jxr6euR/wL8xXAb25Q+eP2pm/z3KTu2x4PrJ19dPDfbYiKaBuuHKazl3srXRiamkfb8429IvG7+W+Edmf15E8FEwBU08zp8/OuIhS8gBOyGDKKQCJ/eSG08zmqidhNMbLx7viOSG2cxqwPUJhc9tZb+7yZUzyVl+or2Rn5kOMuca2Sc0ii8aRtF7ZNqHCgiUAcQLLhNcqkfm5z4tfgkaAhd4e8yolh+O65OT0dP3k00RP908xgG4QZs5+MzEPQ3fmQvyc8C7AcjzIKoSFEDGMpQZDuMOFwEXjPg8Ubt6vfHoqDjaL45wjR7pW9ipQgHNA/LS3mw9W8dF8z7AuzTXWxubbf18GDUaMU/1zNihnibQ/0r9r8ohE6PI91oShFXrETHA5iEds1b9XTzGMbQDnCM+5t7M4R5VlKSSfwNj/d3fwhEyZ3MgJq+5hwuEP7yDSfZOzZvfKR+Et5BYshGTAy35TdiAJfyMZd/XuDb1MODxCx4E+DF4TGSHhUMGj5J9f9t8byK9AazeZ9YNxijJlHeMhyOYDsfj82YuNOYfh78SjYC0czqSIf4FiklO9cQfiokBvp8FbmN6eww4+wOLQhJr5JXwDmaOQOTfbp7YKJa6MQfC2d+4RfMNqbdrsU9x6z4sEqsgR47mFQqV0SkLeEB7lge88/IXHkagEjSWS5HuR/UdDb595510tMoL6EI9oB1AURImJ0Ck3giuqGK0Q3o7h0eD/l6P7Pa7f+ru98heb7//Y2/wJ3JYH9T36ziXWlVkWXfI4pDld4fM52lAksjjNOiQXb9OdncOdwY7u/2dGhGyTtqbWz/USJeGdbINf/d39voDxCRAqsGrN4M+2SPd3sFRb1AjTNXJRo0kwNQiSdZrZDf1QG64/Kj4SqPahr2otih9xSHjPZCx+6bfIetbIDk2W5tzGGPJRt6c3cjvGYsPUPSd/UZzeh8E0uTK+RiUgV3J6PtdBqoGu3L1hPvRSRdALaPgymLHu75ZtAi/Pls0/dLJWXaghwsemBsCNlJ3GwkYqEAWv9NYycfHd52WqRPGxF0GN6bflxyjBo6ayfNHNFVRMdQLGJVmZkWHSfa3uArqIpM4GIb5DEAoIsHwdxwBYmxsPW0W9+b36G+59ZZn61v5fs2fh98BigWi4UgxmX3IUEMy+4FKCO794scgDVj2Jfr5XFsYEDjZHfotsuMRGjP29RTZ607pJN6ybDrJr+xX3r26v5OQBkGXxtfOK8nfX93udyMgabFZEDyNu26SCZNqJ+BjUTAamjCEyKJJdRl48ZYjYY6EORLmSFh5Sdj2zepEhkVOoagAiJ/aDOJlA7Csm/o+GuGrg6PBTveI9A/2+j/2997s7KPp5eWbg+7FP660TeWZzRiyKCL4jV5gGh4/3frzVrox4TjAOBAbsxNPvcAt5wW+N9Z++qvwjhmnilx+5AR+STbmIETBiSQdaqvqT0K+9VBXoJ566/HwZ0IASuQnnyr6NmGhoJKZ83A7ye5PAzJmgkkaEJ8RNuE+E5e/XJwTShIaUMnp5S88iKSNpqMde22gy+ZnZSC3uw58ZQZf14GvenzpmI+Pg8ykoy+cHHPF7smzdurk9cW5RAbCSM6Z0iBdbc/dnsObMoOv58BnD9lbBlETY/qOqkh2yMLImOMfeqlfM5lEVFDyLpXc597FeYVWfAnrWXM7dsErvLTowJXYv8RLSWKCy9CCUaHFtHIzH/a6R68GOubuzX7vx53B3pv92Ui+g0ERybfzsjfYMbF8F/94ezBf72jn78gGTNd9M+hd/tNRv1YhGC4FISKfjHji0cBhw4LX+sYYunKv81JEEMUCNoqEk54XvdTN9a2N1sbG1na7Qiu9lC0rGfw6Y0JRRQI2BmIbS+7kj0UvfP/VQe+w+4Z0B/3Do/7OQYXWexmyAorMICjoRCb09VVoOR9q+369MWjvZf8AdudgByTllbZqv3BmUXvwYQnk5fKfVtqr02rau/8fhjo+dORQizX9aD0+nSTbReRQO3vBa5FD2QWHk19nwDEBPCoNnLb1ENz+J5GG7G0WFqV+rpQ5fQnb049C7vEAlrJxcY7i6cot59cL8RVaouWhcb7x0ikuu3VdsBGlQgu8DOU9jhKWRJI4Q//C17rbr9ISL2EB4Q+nVVrD5XEqXEqM2Xf86SGEJ0yScAv5MHoQlW5bOpneAm7DAj5kkipQIZ1TY+Gr/VO+3G99ViXsX4ZMX6Hls3KvBpRg6iOQhU6Fltrt1OrtVJOim5FWWTWBfxk7FkOFuwev3c59CHHfE/HUUjq/pJZ4X1ur531dLfe6K8NtESVaAkGnIZlWwMiiMdOgSComXPh8wv3UlLEIU+EZlyJJZXhxriLgqiYH2eeXv3BOaJLGkhIYJSP4C9PDtQkTXC1OViwDnrkK3qUGn8VVoZcNvrJy/gcmpLt18mrImTdLPbEkQ4fsHPyw83c7g95K079Nh0BlBt+WA5+jf5/37tcJ2Usl2gXnyN9KU71bqr/agDb2q89lXZN7IM8B85liMuQC/W21vEIgYFCF7GxLIEqr559wPohlBW7MBbCnMvz0q/BJYqwlHqMxlv70FJ+Yhmdk6kTLColyGBUzybkpJWqjNfiWSteOnVVFXrmlUHN1APw5/uJkmYXz4706eQ0kLqK+JnyxjIYX5x0bSV3JSyCvzj5fhs/kMfG1putEpwVHGzxrVmiJl7GAZ7pCMA2Y8EE0TRT32G9tJLcWlyx3gof123z4eOqBhv0eGxGD8amMQdZ8ip5rdgpIcHH+2Gm9CwbJ27dvn8D/31ZonZewiivd9bzlGiGUGnyuHr9FxMtKJtGrk/3IS2dCy1aa3rkOCBYhzBLQoVUnOzMeggSrCSaji/PLjxGVILzGrELSlJUEiRz1Br2Dmg5wPYuENlJOnTZkTZ8DbZomJisSKJaSMMS0rni80tSr5IUKnYL+jT7Qdp18+osgAY8TSlKRchJE3kzQ+IifzsQ1kAktqFuKgeIzhA8+bMRcabXvkccJIKKZ1cQLOHaoxJ6UZC2kY3rGBcAJqF3yPUldeWFjkXZfGaKiSQqcSxTx6NkV+jFkgo24x5GSVGgpl7YfVzpWs21xoVmnfT3QDqePMcctUZrnkSSNA3i4UFSyDtAQjFuGQ0q8YxaolLNAM0M6YhI7lRPmHfOYhjpDDsSbWEax5ClJFQ/4GVVaa+DY0pwlQKDwkUCccKhRKGZdFAM2ToPpVH28S9jomWtbnAHs0OKB0GL4GGRuPk6xRgJtzCCCklQkcSTNLr0mBVasV+MySvXeRnRgrYvFJ3E6DLhH1ugwEpposMYQqIhij0EiSmcG0gDpCAVVakqVYhgvU5gwDmiinwTECIE4I/sDzitsVo+PrsEdZEjPQKqKvFQ/DV/oXZooDtIWTl4laeu7yPaW0HKX7F9qCdXlkFtEN6y06LyokxcsAOETbW58pRuHtC1O2V/83qkWri0DkwCBQDiijZDpsssVknispFxk/013cPGP2Be3++plb9Dt7+yjxjyKZKi7sXbhyma7vd5crxAolrDQv11ppuDKUJQafK4MhUXEy0o+8kM9r0KheBjnZqvMBX35kWPPWSoVP9OWEO1ZSjldbc+Hq1JRKrxbSmRahYQuK+kWeUVGkqLKkQrdRViA4EtrWaLhHDELUk+mZMS58DVto6c8JE+bJJKY+lIlg/xDQerrI2NSMa/xWUKpLS7A4Ojwd8k8rpPBrAATy2gsaXhFzkkYGcGdQDyw6oiXhliPhNGzi/OOCW3lAVZtdW09Fg6w/TcH/Sd7b7CZeXeB2Q0rsflNFEUkuQdbn/gcj3Xx4TSWXMCeL+IvYNI0gKtUdkhzu9NsPmm34V+32xcMoVfSUZSHED9GATvl6OFfabXU4mJETtj5Lln9dfI6l2/mpZs4wnScMPJ1RMq16Do5H12neYJozJYlheEB8zBOZjovjQOYDNCuQiSsdJHCK0Tlq8QqlyFaP9mrkZxT1rKkIV1s8dOvaraEqi7CmOcKsDOt96AVOE3wSqwuzrFWY9bgggseko2n2pgCBCNhXooBbzVtO8aJhA6lw7QlWCwkGxs4tnHGawQoUch8jhYagQmb9TzSzo9SGKhr8RTkZu4NtUAL74THAWZP5S+oRV14pCF4I05CCv/nOq+q1b76lmj7Ro0vuzLzLDMdzM4SpS+0N/Dfa/d/Nv90fonz1YBhuudHnAqtbM6lcs2keGEjSfi2JAIgmIupgFe4sgqjzO+ObzdEjdVZHheMR//nX1Zayix5ob9VlDK/eot7IEkeaEo1iSRhI+zSQTXxm00BqSHxYqcei//tX4EAefQslXks9iiS//avQMBC+i5CUohh11lgNcZca5v8xbnkJJVjnSsChE9hNW8sQMWw/5HkOmPETz2s8Qu0DzNLPI/7ejjOB3Q1uDhXqZ6IZ3SZi3/7Vx1/rV2VkaRWBhZbXL5t2UhUBhpY8kJLLhDyG+lju+50kW+SoV5GPg0KkRc4y5gK7aEhNAvF1jaKxDvm4RC4Su0G18zKQeDrrQ5V2qVW6gILr9pYBm7o6taVGnwWV1FbPM5XS9yxkkb+oU66kfCYz690Z7Jk/1tch6vc+78ExG/dFTGxiHwto8FK0YHREKiUEyqy5t2Rz4/RRJ+7AJwwvVhYtFsVWuGlNa8wllXdaN4EgEmqS114aZU28II05jhvtoSriB44G63H6xaXGHoYwuLY2reyNUZowkImGK1Ny/6dmSK8qSj43aw/x7G4h6EhbzOjUJUWc0FLhQzLxSs8eGiUJWzK4upJ9rOpMijPrr5SBWnPg8oh/To5pFWKD14ahafyqvl01aiNxfWpVo/aLKfby6GOfTXJDbripg4cJkOZqk6W1+1ozaKNdFuuoNS3mekCtrhCg7au4EoneyxNaFgztl+qMJFASIzgXemeS+uunJlFaLEM7lUnOxh+zgKmC3XroHHFlc7mWemiVuuuVNxqowaWSsGi+Kl00skdIms3UYxroP6hV42cMPaeCZ+s6V95qos3zewzfVQwqW++okzy6ddweHGuTLm9Bia2+CmmVXoX549t7HCy7srfVRAFHrwSARc+CzGoX7cOqhBJWZo0nwebW0kUXKU1i7bowtJCb+sGpnnakAreAZ4XSV/XWsNewBMqEpAoTHsedgYKqOTA82KdbZ+18plyy2N+xvNk9hC4puQUmKRgHkt0xn+RHG8yPjP2CqfwfdbYaYeEF+ciBT5aw6PLjwqrDICIn4ZYpyRr/5M9bto/iATRmIMa4DGTjnr5C7MSx1yBn+rjmP8Yy/QUyXFTfMOc5msoJ6hOf+6QOBUMcS4A3OEggmo8MvJlGjJjLxeIs0NMzQ5NIJDGzluQcaaTGU6K1TywlOpcB9ys6a1Ot847YtmJOa5oQekw50EF0vU62cM474CaCjFYEgtrBzBgEXlJlazYS4UkVZdWarE0fzhbSslEao8407vzTNPaCccGg2QtL7KhBaMEJB+0FkSm0kbAxiAhPV5cDF0ZLJcWF9Nw9ojvRpU26uQlUyA6Ie7EAVraOsRRqgdY2QmXujYkipBAnxoc5E4QKiWVVmZHWFycxZEDi7b1p78IXbMqIPkG1+l/ZpNrswHqPv3dnQNTLzWTGydUj58XGjvkJw43vs2L8/1sZUC2xYUa7MeMMkhCFpdyWDb4yrqlH1gR/rssAMILaHrGFqjJlQFdLK78sHrosqSQhyLj19eVJ+mEn2XsHiWDLE9SV6B0ZQC+D1TazWuJ7BVa8qX0gcn7Au+zMWxkIetkc73RBgpInpBu5Bf9z7V77Atl/1e6H+6Gqxez2rg0/CLL8FnIE84KflEh2mUluyCOXyyBX7zU/EJXAM+6ymBIBkABHcVeFMYBU9kZoLQaYSS7C3uZdpVZbUZjcY0Xx2i+AxJiCf4pU5kaIKfdP/I6yOgTfGLiM4rmI2wu9FiXUlZAHLkAAgmnaoRrBM8DObDk/sX5Wap0hAeVqt56SmjARZ2stR7r1oFAChj9rOhomgVINr44T7imA1mbqQzdMSIUXsnPqqs5abK5YXGFDIfk3wHJfUByOjXHrZzY4rJClxlHvtKk1+LaNc4X9hAAduVCKkjrHpT7/n2d7CjJh2kuBUeJ1kpXmi66DHmL0GZBAsCNu54kqVCzmqCJSL38SIshNUIFOzVtKb+g1610ROqGy6WvPhINeOKl2sCZxMxDC+gMLl1BIwbzppk5FJvpwq0EM9uCyNPDp9bP3GxiEA/O636Humu3bo41ApSLii6LeqJYRiOW8Ag78mocdjrSYuWGhetPtuLIg67ianMIV0Oh4gB2+fAWkbelmdr2XXXzRbv/u5KjfzkTrbSkZUSl+eoAM1ISXpz60VK+0nW/NuaKCoAqBzcGbARTbbf1LCMuE7XPBcs+wlGzZePhgmjVE/LpL8JnccAFx1ICXiSZh2WpKFE0ef8ka+5OsQBApteYWA2sNGBj1v/GjtvabmubrT1gqKUrXZcmUVT4VPos06K9SPgpMooa4WPORKaGT1iiuC62oUtp4H7PC15Yudt33W53u93s9h62e8I6Rib2B+QjJsiaSMOLc2mqpx/+/Rsk6CTxqABq/tjGTN6NrtvR37SjyyB+WpyTumzwOQ1Pk7OXun+0z7UaV1jKV1tpc4m+FmHNcnqh7MwE+CZsNvg3KzHsFUgjMNQ3YPlZjPzVN2L0PnqqmM+0a8pUE1ptw7zFOcHOMP8AAN50GXwWkc6lGeYPqmSYd8HW5ZRs9ySLFWrhaG6KhjCvqayMvDoGVR1+6NKqEhg9aL/JxXmWv2PqsSYMA1CmKT5OMG5uurQ5i5BuKSU9CPOOeWwK1s1HJsYyUsxDY26lKpguiPrnldTnVy4vDw1P53EaoKd1LQAFJAq4x9G8bmXLkk2XaFe6DfvAZRtuJwtYNyB1FOHLiwj4L1J0CMdMJhhIoavIe7Ci08BVEECCy18uzkMujI8YVh3kFrQ0KBrE6E0WivtM0pjq+9byWgMv+OVHxsnrLITWTjpicdaYoyPfJSt/pi+JdhZzL3qSADNE3ueIyB0EtISPU0nVbC8JenMnCbIGlCNORQ2oDFwcof9eKDsJg8s2LN3WfeBMfqyXMY0WcerGVy6gSE3BLF3vxEoUtzgz0nkGHgLAJc/a+xxFW3XQunSbbwBwWdfkgVn8Kx2HMgq4p1jmTA+w2JXuwIYKrtZ2Gcc+bDXCTpmX6njTWl4hz/xI0iRmwnRIxHp4eBczganwrLO8DUGeX31jdnWV5ImluQDjSJERR9MlpsJHGAZJqPr0qyIxiiGYJhJyLESIgcEens+soVxgBDEGV75Lfebpbkzw+QgXrHzIlLGI5Iqivg0PMXEXWz3Bg9Gjo3D7cG5j5OWmxdlr9tPLMjBE10rUIhK4BGb2Omc1X2A0yROa8zWqNM/zoxTOA3sLY3T/GNLISCpgrsw5lPex05aclQ4n23SNR0sNPotbC5YCfGoYZH8yajQMDtUHEK2yW4/oMGAZ24Zrf4TzJ88fPWuuN+v6FdSHGMiWf0rNkCkEMA+kuG2ffohSVQwf8VPmTy9G0fviTbea+cvOvtIPkvt4OIa/3SgwL7Gx/TR7sfnT7Y1nxdx4Y/eYijF+EMdt8+gbpmzM3Nm4Mv/8VTg0754Bw6NCHcYBV3Mg0Tf8gVGfyaugym9Unvk3//WSmoMoNq/Wat4MCFz+z48AFFFR+PkxMuNmtw5pFO/UmL7lkknCXFLSCfejky5y0Ci4svaOWtj/xQ8sVO2IMX1HQc2rLVPmaUzR2iH3VyL3nkNuh9y39OvOKobYgNuNqQDgxIDlUIqeoxSloBRWuhJ6O4dHg/5ej+z2u3/q7vfIXm+//2Nv8CdyWB/UF1g0yokPCyUKLxxRWCmi8NWI/5NIQ3Zbl3AnS6wm2dhqVpZsLCsmpbwk5UHljP6rg95h9w3pDvqHR/2dg1V2xWy1Kotl1cKkZej2LBQ6kIdWKLBmUVnhb81/N4StONXh/tSpXVnq5OJSb4f6emWh7niS40kW8aSv1XLlH9gsILc32/rTBmkAD6ZqH1fAKcSLIosbjixWCJ0ftt6/BSYzh9P3wOnNUuL04s061aII/Mrq8O9lWT/Ezmc+9r2PpJ8VtsTKHjqxxqfKpJZnhSsYWfuhvld/XR/UH0/TMQa9H97s77zsHRy92X/TJ2tveo9Ju9naamxtP9Ohz4kXxWkwzfPhHMOev5SrY7JGZBpgAzhOJI0jqdKih5sZtdSogqXThq0Vpg3Vwn8rzeA7IdbQCwHFU1FkLmiMjoCVcmycuFSxYun4t11K/Fs2dpUBsk8dZCsK2WcOsqXgiIuSdwvz4MMbv5xF68GxdcdhqzPJ2LYpd92mrKhw4JLUVlo42KOK3iAOLH1buvSqcmzLh7LifH18tA87920Csi2V7K3HQ5tCpBsneT77ktHIdf+yCFdWzQe69N1vcYcut/vd7l/s7t927cvc7l/d3e/aO5UafK4NT6nB57qflBp8rkdFqcFncf8BB74vg6/k3QVWHXwWdxBw4Psy+CwuaO7A92XwuXLlpQafq4JdavC5KtilBl/Xga/M4Ntz4Csz+JyzvtTgc97mMoPvqXOXlhp8zt9XavA5f1+pwef8faUGn/P3lRp8zt9XavA5f1+pwef8faUGn/P3lRp8zt9XavA5f1+pwef8faUGn/P3lRp8zt9XavA5f1+pwef8fdfAN8QpTDGbmI6LorUrtzeeOWdiqcE350xcHqiG+Uq5srELWpOTji/pCRdjOIw7XARcMOLzRO3i9tRHR8XRfnGEa/RI38JOFROKeKcw82br2ToumvcBS3uttzY22/r5MGo0Yp7qmbFDPY3e/0Tqf1WGCzDSj7zXknDYiuuPiKAhUFIeAilt1d/FYxxDO2NJ42PuzRxiER+SSliyY6XiTqOReMcspEk9ipk4DYNRJEOq4KccN7LvDYNGu9ncasTcU6lk8DFw1IlxWjwQk9dcVx7DH97BJHun5s3vlA/CW7Ca9ojJAQuo4hM2YAk/YzmuX5t6GPD4BQ8C/Bg8JrLDwiGDR8m+v22+N5HeAFbvM+sGY5RkyjvGwxFMh+PxeTMXGvOPw1+JRgfaOR3JEP9GoxE51RN/KCYG+H4WuI3p7bFM1A8swgrCCbyZhHcwcwQi/3bzxEax1I05EM7+xi2ab0i9XYt9upoMte0ocnWAeUu0gAfUkclly0f2g7isa3L77ry1hsWL/uU/7ZDXrw51owUcb1mhume3hE7YsZdXb6cuaB/uCHZKSUCLBh5pcHMLj09/FZKNQUSUVOm+AQPzC8b/wASTZnAP7mPi8he4gZJD0+P78hfd5yNJhzZu81tCTNw2t/eL77HNhawvrmrQCrGtn4R8m1MKU5sS1EZBrtesXNhil0EM3LJDpl829SgDqOZinN4zFh+gYjz72ub0PqiryZXzaAnelYy+32WjSLIrV2+q7ZshZ7zrGyTThdkzJNMvnZxlB3q44IG5ISvQfoeRRaH2O4zNC7bfZVqmThgTdxncmH5fcuzDRbRbPH800v8Vg72A0Yy94oxcjBE1RsBzsymHek2zH2gswB1b/MiakKYqMnOAyELMMmV36G/LjkdcJmpfT3GtuDLesmwu/2VqXrSUy95/pqVcdiYJaRB0aXztvJL8/dWteTfmkBaAjURWqm8WoHrxbwDnhEm1E/CxyK8NacIQZtUTVlYIcPeQFQ7SkOnOf3BK4LHioF1Q2XGS2INIYrCkbxOjYqnl1ghfOhd/6ri44+KOi1eBi5eB3Dxz5MaRG0duqkBuHODsUhr6K2anXS6sEyChwTKh7TOh+Ih7ukW96RI/4oLjrzhKQF1M+UorNjtO0nCShpM0vh8Rq5assRKSxExsvgLq+EdJ4xi2RD6o7DC0Hf2WKy+26mQPrcsgMmiJoVMh6XGV4eq0gJIy0HvAej/15MW5iiTxopBJj9PAxkixXSeLO1l8ybJ4ZVhCteRs2yn8cnl5u066kU+6rwaVcv2vMkg32+315nqFgOkweFWk8VWG45oXCcyZJd2AJmh3vziXnJPIS2NM09B5GhjPDcv16VfB6WMb5fCuk8OdHO7kcCeHOy7+ddR/vU4O+IQFabB456pDye8J2Q7pnTIvBRbOrsRPWMKz9xzPdjzb8WzHsx3P/jrKvlEnWHEIlTPipcRjAfwKlHF2ppIvzt9ZhvCo3jLYikhD80AeTIIrt8G1vp+f28zWrbjBMaRFMqTt1sZVlnRMxRge8fzR+ub2V7OkLg34UPKc5s38nNK6mZMZjcvPzNO25jXa1lwibXMcqFQcaNn++T6TVB5zj7ngmmoIFeQJYQnIEEk6jKQfCaqIz7GsXyTRKEDGpqDPb1datnjhZAsnWzjZwskWTrZYICt6kQoPlFvgQYETL6oiXngpUREFAcNnwFQVDbGYXsBWWp7YaTp5wskTZZAn7OJUTp5w8sRX8J5uFFBQaql00kSFpAkv4FhVmHNTT4zJBAXGNCAhHdMzmBsD11DUQMMFq6+0nNFyrvaqSQtf5Wq3oRVTZeiVEx5KCrh7MJrNOjn0ongmOs6JENWALDkylUdnQEuoh12c6JlpbUD8KGSCwwC8hXsmFB6FDRqYrNTLX/C2GhYzTdSnX4E66xm4ujgHwYQkMfMwoJ6RNXbawVHji3OFWel4tziDO2ksowk/Q1sXnA4okcAd4HTqc/iDia+gAvocJejH+p086svbZBx4AheEY5OCkPn44jQOuIeBIoyTI5q8T+tkx7whVYzCd8F8WLadSX5mvltPMQrYKR/yQA8jkvswCXwTvJcY03cU+0HQif5e0BUBLnoynxH6xKwOG+O7RGNJQxiK5xIqgfvxgNVQdIPlgqVRusBPouADqfT1p/j4QtljeRinCdPTmqdmi198OrtNurNE6Go7ocsJXU7osl/oKoMGt+6IyUoTExuCpVdIVXA6XkkBdw9NoO/qi66SN2AHvmGYFoZj1EUikVCt7hi9jQbMVRpFoWPDCR0rLXQ4DcaJFFUHyz04yBMyZokyNjs6NXSlvEMOWZAbtgxzOYNb9E9sPJ+ZuILUk2kWXa1LaxRmOmqsdDVt6huZMDhtAvM5cqnCJqefGktueilFQ8605RL4VqIMJ2NoZysMZ2lgpYVs0/EXx18cf3H8pcJguRd/YVi5IfOPZJ6TSHbIYMZvAuQdv9RT7PIXRuA3k1zAoW6rXTieRsAZLs5lyokCxkLWgP6Kd/r+EE6PQAcqfE7wFUXXBaa4d8wUTlYjXpTxtKnbiimv/thKlrLlWIpjKY6lOJZSYbDci6VEoC0IQ8UvzhX+wfhJ1SGvRkD4keingnHgPDGTOrCSkTi4OAc2xIpQy7wUYOaCrxHqRdLXHAPd9AlPFI7DMIIIdBDuRTSBH7qHD2o7JqkHh8PrJaCX0Pxlrodv6oAMn8J1k5fq0TNLtRjXLtyxHMdyHMupMljuxXK8Iu8CtZWb4rbmVRqVqlQCiwFMNOawIuCOC1iPFPlHqlUhDFMLuU4mRAXmFu4BR/7F+ROCPIjpSD

  const TARGET_EMAIL = "balogferencz.artist@gmail.com";
  const CC_EMAIL = "cristian@eastride.ro";

  const form = document.getElementById('contractForm');
  const statusBox = document.getElementById('statusBox');
  const btnSend = document.getElementById('btnSend');
  const btnPreview = document.getElementById('btnPreview');
  const pfaFields = document.getElementById('pfaFields');
  const cimFields = document.getElementById('cimFields');
  const cardPfa = document.getElementById('card-pfa');
  const cardCim = document.getElementById('card-cim');

  let mode = null; // 'pfa' | 'cim'

  // ---------- Szerződésszám generáló (localStorage) ----------
  function getNextContractNumber() {
    let currentNum = parseInt(localStorage.getItem('last_contract_number'), 10);
    if (isNaN(currentNum) || currentNum < 412) {
      currentNum = 412; // Kezdőérték, ha még nincs elmentve semmi
    }
    return currentNum;
  }

  function incrementContractNumber() {
    const currentNum = getNextContractNumber();
    localStorage.setItem('last_contract_number', currentNum + 1);
  }

  // ---------- Dates ----------
  function fmt(d){
    const dd = String(d.getDate()).padStart(2,'0');
    const mm = String(d.getMonth()+1).padStart(2,'0');
    const yy = d.getFullYear();
    return `${dd}.${mm}.${yy}`;
  }
  const today = new Date();
  const startDate = new Date(today.getTime() + 3*24*60*60*1000);
  const dataSemnare = fmt(today);
  const dataInceperii = fmt(startDate);

  if(document.getElementById('dispSemnare')) document.getElementById('dispSemnare').textContent = dataSemnare;
  if(document.getElementById('dispInceperii')) document.getElementById('dispInceperii').textContent = dataInceperii;

  // ---------- Mode selection ----------
  function selectMode(newMode){
    mode = newMode;
    cardPfa.classList.toggle('active', mode==='pfa');
    cardCim.classList.toggle('active', mode==='cim');
    pfaFields.classList.toggle('hidden', mode!=='pfa');
    cimFields.classList.toggle('hidden', mode!=='cim');

    document.querySelectorAll('[data-group="pfa"]').forEach(el=>{
      el.required = (mode==='pfa'); el.disabled = (mode!=='pfa');
    });
    document.querySelectorAll('[data-group="cim"]').forEach(el=>{
      el.required = (mode==='cim'); el.disabled = (mode!=='cim');
    });

    refreshMarkers();
  }
  cardPfa.addEventListener('click', ()=>selectMode('pfa'));
  cardCim.addEventListener('click', ()=>selectMode('cim'));

  // ---------- Upload previews ----------
  function wireDropzone(id){
    const dz = document.getElementById(id);
    if(!dz) return;
    const input = dz.querySelector('input');
    input.addEventListener('change', () => {
      const file = input.files[0];
      if(!file) return;
      dz.classList.add('has-file');
      const reader = new FileReader();
      reader.onload = e => {
        dz.querySelectorAll('.lbl,.sub,.fname,img').forEach(el=>el.remove());
        const img = document.createElement('img');
        img.src = e.target.result;
        const fname = document.createElement('div');
        fname.className='fname';
        fname.textContent = file.name;
        dz.appendChild(img);
        dz.appendChild(fname);
      };
      reader.readAsDataURL(file);
      refreshMarkers(); 
    });
  }
  wireDropzone('dz-front');
  wireDropzone('dz-back');

  // ---------- Marker progress ----------
  function groupFilled(selector){
    return Array.from(document.querySelectorAll(selector)).every(el=>{
      if(el.disabled) return true;
      if(el.type==='file') return el.files && el.files.length>0;
      return el.value.trim().length>0;
    });
  }

  function refreshMarkers(){
    const step1ok = !!mode && groupFilled(mode==='pfa' ? '[data-group="pfa"]' : '[data-group="cim"]');
    const step2ok = true; 
    const step3ok = form.id_front.files.length>0 && form.id_back.files.length>0;

    const m1 = document.querySelector('.stop-marker[data-marker="1"]');
    const m2 = document.querySelector('.stop-marker[data-marker="2"]');
    const m3 = document.querySelector('.stop-marker[data-marker="3"]');

    if(m1) m1.classList.toggle('done', step1ok);
    if(m2) m2.classList.toggle('done', step2ok);
    if(m3) m3.classList.toggle('done', step3ok);

    updateReview();
  }

  function updateReview(){
    let rows = [];
    const currentContractNr = `${getNextContractNumber()} / ${dataSemnare}`;

    if(mode==='pfa'){
      rows = [
        ['Tip colaborare', 'PFA / SRL'],
        ['Denumire firmă', form.denumire_prestator.value || '—'],
        ['Sediu', form.sediu_prestator.value || '—'],
        ['CUI', form.cui_prestator.value || '—'],
        ['IBAN', form.iban_prestator.value || '—'],
        ['Reprezentant legal', form.reprezentant_prestator.value || '—'],
      ];
    } else if(mode==='cim'){
      rows = [
        ['Tip colaborare', 'Contract individual de muncă'],
        ['Nume și prenume', form.nume_salariat.value || '—'],
        ['Domiciliu', form.domiciliu_salariat.value || '—'],
        ['CNP', form.cnp_salariat.value || '—'],
        ['IBAN', form.iban_salariat.value || '—'],
        ['CI', (form.serie_ci.value||'—') + ' ' + (form.numar_ci.value||'')],
      ];
    } else {
      rows = [['Tip colaborare', 'Alege o opțiune mai sus ↑']];
    }

    rows.push(
      ['Nr. contract', currentContractNr],
      ['Data semnării', dataSemnare],
      ['Data începerii', dataInceperii],
      ['Carte de identitate — față', form.id_front.files.length ? '✓ încărcată' : '— lipsește'],
      ['Carte de identitate — verso', form.id_back.files.length ? '✓ încărcată' : '— lipsește'],
    );

    const reviewList = document.getElementById('reviewList');
    if(reviewList){
      reviewList.innerHTML = rows.map(([k,v])=>
        `<div class="review-row"><div class="k">${k}</div><div class="v">${v}</div></div>`
      ).join('');
    }
  }

  form.addEventListener('input', refreshMarkers);
  form.addEventListener('change', refreshMarkers);

  // ---------- Helpers ----------
  document.querySelectorAll('#contractForm input[type="text"]').forEach(input => {
    input.addEventListener('input', () => {
      input.value = input.value.toUpperCase();
    });
  });

  function b64ToArrayBuffer(b64){
    const bin = atob(b64);
    const len = bin.length;
    const bytes = new Uint8Array(len);
    for(let i=0;i<len;i++) bytes[i] = bin.charCodeAt(i);
    return bytes.buffer;
  }

  function compressImage(file, maxDim=1600, quality=0.82){
    return new Promise((resolve,reject)=>{
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        let {width,height} = img;
        if(width>maxDim || height>maxDim){
          if(width>height){ height = Math.round(height*(maxDim/width)); width = maxDim; }
          else { width = Math.round(width*(maxDim/height)); height = maxDim; }
        }
        const canvas = document.createElement('canvas');
        canvas.width=width; canvas.height=height;
        canvas.getContext('2d').drawImage(img,0,0,width,height);
        canvas.toBlob(blob=>{
          URL.revokeObjectURL(url);
          resolve(blob);
        }, 'image/jpeg', quality);
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  function setStatus(kind, html){
    statusBox.className = 'status show ' + kind;
    statusBox.innerHTML = html;
  }

  function submitViaHiddenForm(actionUrl, fields, files){
    return new Promise((resolve)=>{
      const iframeName = 'fs_target_' + Date.now();
      const iframe = document.createElement('iframe');
      iframe.name = iframeName;
      iframe.style.display = 'none';
      document.body.appendChild(iframe);

      const f = document.createElement('form');
      f.method = 'POST';
      f.action = actionUrl;
      f.enctype = 'multipart/form-data';
      f.target = iframeName;
      f.style.display = 'none';

      Object.keys(fields).forEach(name=>{
        const inp = document.createElement('input');
        inp.type = 'hidden';
        inp.name = name;
        inp.value = fields[name];
        f.appendChild(inp);
      });

      files.forEach(({field, blob, filename})=>{
        const inp = document.createElement('input');
        inp.type = 'file';
        inp.name = field;
        inp.style.display = 'none';
        const dt = new DataTransfer();
        dt.items.add(new File([blob], filename, { type: blob.type || 'application/octet-stream' }));
        inp.files = dt.files;
        f.appendChild(inp);
      });

      document.body.appendChild(f);

      let done = false;
      const finish = ()=>{
        if(done) return;
        done = true;
        resolve();
        setTimeout(()=>{ f.remove(); iframe.remove(); }, 1500);
      };
      iframe.addEventListener('load', finish);
      setTimeout(finish, 9000);

      f.submit();
    });
  }

  function collectData(){
    const nrContract = `${getNextContractNumber()} / ${dataSemnare}`;

    if(mode==='pfa'){
      return {
        nr_contract: nrContract,
        data_semnare: dataSemnare,
        denumire_prestator: form.denumire_prestator.value.trim(),
        sediu_prestator: form.sediu_prestator.value.trim(),
        nr_reg_com: form.nr_reg_com.value.trim(),
        cui_prestator: form.cui_prestator.value.trim(),
        iban_prestator: form.iban_prestator.value.trim(),
        banca_prestator: form.banca_prestator.value.trim(),
        reprezentant_prestator: form.reprezentant_prestator.value.trim(),
        data_inceperii: dataInceperii
      };
    } else {
      return {
        nr_contract_cim: nrContract,
        data_semnare_cim: dataSemnare,
        nume_salariat: form.nume_salariat.value.trim(),
        domiciliu_salariat: form.domiciliu_salariat.value.trim(),
        serie_ci: form.serie_ci.value.trim(),
        numar_ci: form.numar_ci.value.trim(),
        eliberat_de: form.eliberat_de.value.trim(),
        data_eliberare_ci: form.data_eliberare_ci.value.trim(),
        cnp_salariat: form.cnp_salariat.value.trim(),
        iban_salariat: form.iban_salariat.value.trim(),
        data_inceperii_cim: dataInceperii
      };
    }
  }

  function generateDocx(data){
    const b64 = mode==='cim' ? TEMPLATE_B64_CIM : TEMPLATE_B64_PFA;
    const zip = new PizZip(b64ToArrayBuffer(b64));
    const doc = new window.docxtemplater(zip, { paragraphLoop:true, linebreaks:true });
    doc.render(data);
    return doc.getZip().generate({
      type:'blob',
      mimeType:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });
  }

  function validate(){
    if(!mode){
      setStatus('bad','Alege mai întâi tipul de colaborare (PFA/SRL sau CIM).');
      return false;
    }
    let ok = true;
    const allRequired = document.querySelectorAll('#contractForm [required]:not(:disabled)');
    allRequired.forEach(el=>{
      const filled = el.type==='file' ? el.files.length>0 : el.value.trim().length>0;
      el.classList.toggle('err', !filled);
      if(!filled) ok = false;
    });
    return ok;
  }

  function removeAccents(str) {
    return str
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "");
  }

  function safeName(data){
    const base = mode==='cim' ? (data.nume_salariat||'salariat') : (data.denumire_prestator||'prestator');
    const cleanBase = removeAccents(base);
    return cleanBase.replace(/[^a-z0-9]+/gi, '_').toUpperCase();
  }

  // ---------- Preview only ----------
  btnPreview.addEventListener('click', ()=>{
    if(!mode){
      setStatus('bad','Alege mai întâi tipul de colaborare (PFA/SRL sau CIM).');
      return;
    }
    try{
      const data = collectData();
      const blob = generateDocx(data);
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${mode==='cim' ? 'CIM' : 'Contract'}_${safeName(data)}.docx`;
      document.body.appendChild(a); a.click(); a.remove();
    }catch(err){
      console.error(err);
      setStatus('bad', `Nu s-a putut genera documentul: ${err.message}`);
    }
  });

  // ---------- Submit ----------
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    if(!validate()){
      if(mode) setStatus('bad','Te rugăm să completezi toate câmpurile obligatorii și să încarci ambele fotografii.');
      return;
    }
    btnSend.disabled = true; btnPreview.disabled = true;
    setStatus('info', '<div class="spinner"></div><div>Se generează contractul…</div>');

    try{
      const data = collectData();
      const contractBlob = generateDocx(data);

      setStatus('info', '<div class="spinner"></div><div>Se pregătesc fotografiile…</div>');
      const frontBlob = await compressImage(form.id_front.files[0]);
      const backBlob = await compressImage(form.id_back.files[0]);

      const displayName = mode==='cim' ? data.nume_salariat : data.denumire_prestator;
      const sName = safeName(data);

      const fields = {};
      fields['_subject'] = `Contract nou (${mode==='cim' ? 'CIM' : 'PFA/SRL'}) — ${displayName}`;
      fields['_template'] = 'table';
      fields['_captcha'] = 'false';
      fields['_cc'] = CC_EMAIL; 

      if(form.contact_email.value.trim()){
        fields['_replyto'] = form.contact_email.value.trim();
      }

      fields['Tip colaborare'] = mode==='cim' ? 'Contract individual de muncă' : 'PFA / SRL';
      fields['Nr. Contract'] = mode==='cim' ? data.nr_contract_cim : data.nr_contract;

      if(mode==='pfa'){
        fields['Denumire firmă'] = data.denumire_prestator;
        fields['Sediu'] = data.sediu_prestator;
        fields['Nr. Registrul Comerțului'] = data.nr_reg_com;
        fields['CUI'] = data.cui_prestator;
        fields['IBAN'] = data.iban_prestator;
        fields['Banca'] = data.banca_prestator;
        fields['Reprezentant legal'] = data.reprezentant_prestator;
        fields['Data semnării'] = data.data_semnare;
        fields['Data începerii'] = data.data_inceperii;
      } else {
        fields['Nume și prenume'] = data.nume_salariat;
        fields['Domiciliu'] = data.domiciliu_salariat;
        fields['CNP'] = data.cnp_salariat;
        fields['IBAN'] = data.iban_salariat;
        fields['Serie CI'] = data.serie_ci;
        fields['Număr CI'] = data.numar_ci;
        fields['Eliberată de'] = data.eliberat_de;
        fields['Data eliberării CI'] = data.data_eliberare_ci;
        fields['Data semnării'] = data.data_semnare_cim;
        fields['Data începerii'] = data.data_inceperii_cim;
      }
      fields['E-mail de contact'] = form.contact_email.value.trim() || '—';
      fields['Număr de telefon'] = form.contact_phone.value.trim() || '—';

      const files = [
        { field:'contract', blob: contractBlob, filename: `${mode==='cim' ? 'CIM' : 'Contract'}_${sName}.docx` },
        { field:'carte_identitate_fata', blob: frontBlob, filename: `CI_fata_${sName}.jpg` },
        { field:'carte_identitate_verso', blob: backBlob, filename: `CI_verso_${sName}.jpg` },
      ];

      setStatus('info', '<div class="spinner"></div><div>Se trimite (cu atașamente)…</div>');

      await submitViaHiddenForm(`https://formsubmit.co/${TARGET_EMAIL}`, fields, files);

      // Sikeres beküldés után növeljük a sorszámot
      incrementContractNumber();

      setStatus('ok', `<div>✓ Cererea a fost trimisă.</div>`);
    }catch(err){
      console.error(err);
      setStatus('bad', `A apărut o eroare la trimitere: ${err.message}. Încearcă din nou sau folosește butonul „Doar descărcare” și trimite manual.`);
    }finally{
      btnSend.disabled = false; btnPreview.disabled = false;
    }
  });

  refreshMarkers();
})();
