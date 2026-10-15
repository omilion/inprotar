import sys
from PIL import Image
Image.MAX_IMAGE_PIXELS=None
n,W=sys.argv[1],sys.argv[2]; step=int(sys.argv[3]) if len(sys.argv)>3 else 1400
a=Image.open(f'../cmp/{n}_{W}_old.png').convert('RGB'); b=Image.open(f'../cmp/{n}_{W}_new.png').convert('RGB')
w=a.size[0]; H=max(a.size[1],b.size[1]); print('old',a.size,'new',b.size)
k=0
for y in range(0,H,step):
    c=Image.new('RGB',(w*2+20,step),(255,0,0))
    c.paste(a.crop((0,y,w,y+step)),(0,0)); c.paste(b.crop((0,y,w,y+step)),(w+20,0))
    sc=1800/c.size[0] if c.size[0]>1800 else 1
    c.resize((int(c.size[0]*sc),int(step*sc))).save(f'../cmp/{n}_{W}_sbs{k}.jpg',quality=72); k+=1
print(k)
