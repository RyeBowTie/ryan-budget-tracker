# ryan-budget-tracker

https://budget-tracker-ryan.herokuapp.com/

https://github.com/RyeBowTie/ryan-budget-tracker


# Description 

A budget tracking PWA that can work offline.

# Walk-Through

1. When a user navigates to the page they are presented with their total, a table of past transactions, and a graph showing the changes in total.

![main](https://user-images.githubusercontent.com/74829094/127037335-e15d3f36-e295-4c89-90c4-ac12e11b377b.png)

2. In addition both the static files and data collected are cached.

![staticcache](https://user-images.githubusercontent.com/74829094/127037376-ddcf44c2-c58f-461d-93c7-1271086f13e9.png)
![datafilescache](https://user-images.githubusercontent.com/74829094/127037377-729633b1-fbc3-45bc-8f1d-16aa74538e96.png)

3. When a user goes offline they are still able to enter new transactions. These are stored in indexedDb.

![mainoffline](https://user-images.githubusercontent.com/74829094/127037393-ce4d92a8-14ea-46c8-939f-d138402a9d2f.png)
![offline](https://user-images.githubusercontent.com/74829094/127037397-3a865d17-732b-4afc-b5ea-6260b0150fd7.png)

