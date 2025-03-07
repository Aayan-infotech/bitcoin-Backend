# include <iostream>
using namespace std;

void reverseArry(int arr[],int start,int end){
    while(start<end){
        swap(arr[start],arr[end]);
        start++;
        end--;
    }
}

void rotateArray(int arr[],int size,int step){
    int n=step%size;
    reverseArry(arr,0,size-1);
    reverseArry(arr,0,size-step-1);
    reverseArry(arr,step,size-1);

}

int main(){

    int arr[]={2,3,4,5,6,68,34};
    int n=7;
    int d=8;
    int step=d%n;

    rotateArray(arr,n,step);
    for (int =0;i<n;i++){
        cout<<arr[i];
    }

    return 0;
}